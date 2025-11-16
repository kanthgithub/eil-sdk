import { Hex } from 'viem'

export interface SessionData {
  data: Hex
  ephemeralSignature: Hex
}

export const EmptySessionData: SessionData = {
  data: '0x',
  ephemeralSignature: '0x'
}
