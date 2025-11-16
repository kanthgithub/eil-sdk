import { AbiEvent, decodeEventLog, GetLogsReturnType, Hex, PublicClient, toEventSelector } from 'viem'

export type PollEventsParams<
  TAbi extends readonly unknown[],
  TClient extends PublicClient,
> = {
  client: TClient
  abi: TAbi,
  eventNames: string[]
  onLog: (log: any) => void | Promise<void>
  pollInterval?: number
  fromBlock?: bigint
  toBlockOffset?: bigint
}

export interface IEventPoller {
  stopEventPoller (): void
}

export class EventsPoller<TAbi extends readonly unknown[], TClient extends PublicClient> implements IEventPoller {
  private eventAbis: AbiEvent[]
  private topics: Hex[]
  private stopped: boolean = false

  constructor (params: PollEventsParams<TAbi, TClient>) {

    const { abi, eventNames } = params

    this.eventAbis = abi.filter(
      (x: any) => x.type === 'event' && eventNames.includes(x.name)
    ) as AbiEvent[]
    if (this.eventAbis.length != eventNames.length) {
      throw new Error(`Event names "${eventNames}" not found in contract ABI.`)
    }

    this.topics = this.eventAbis.map((abi: AbiEvent) => toEventSelector(abi))

    void this.pollEvents(params).catch((e: any) => {
      console.error('pollEvents:', e)
    })
  }

  /**
   * run the poll event loop.
   * this method will poll for events on new blocks, and call the onLog function.
   * it only exists when stopEventPoller() is called
   */
  async pollEvents (params: PollEventsParams<TAbi, TClient>) {
    const {
      client,
      eventNames,
      onLog,
      pollInterval = 1000,
      fromBlock,
    } = params

    let lastBlock: bigint = fromBlock ?? (await client.getBlockNumber()) - 1n

    let interval: number = 200
    while (!this.stopped) {
      await new Promise((r: any) => setTimeout(r, interval))
      interval = Math.min(interval * 2, pollInterval)
      const latestBlock: bigint = await client.getBlockNumber()
      if (latestBlock <= lastBlock) continue

      let fromBlock: bigint = lastBlock + 1n
      let toBlock: bigint = latestBlock

      const logs: GetLogsReturnType<AbiEvent> = await client.getLogs({
        fromBlock,
        toBlock,
      })

      for (const log of logs) {
        try {
          if (log.topics[0] == null || !this.topics.includes(log.topics[0])) {
            continue
          }
          const decoded: any = decodeEventLog({
            abi: this.eventAbis,
            data: log.data,
            topics: log.topics,
          })
          if (!eventNames.includes(decoded.eventName)) {
            continue
          }
          await onLog({
            ...log,
            args: decoded.args,
            eventName: decoded.eventName,
          })
        } catch {
          console.warn(`${eventNames}: ignored event topic`, log.topics[0])
          // ignore logs that don't match this event
        }
      }
      lastBlock = latestBlock
    }
  }

  /**
   * stop the pollEvents
   */
  stopEventPoller (): void {
    this.stopped = true
  }
}
