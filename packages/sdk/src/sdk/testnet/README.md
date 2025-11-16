## testnet apis

internal functions, usable only on forked testnet, using hardhat/anvil APIs.

- `debugSetTokenAmount()` - "mint" tokens to the given address.
  - Works with any (forked) token.
  - uses debug API to detect token storage structure
  - 
- execMethod(), viewMethod() - helper methods to call a method given abi, function name and args.
  - also, doesn't require a "real" client, but works with "PublicClient", using underlying "sendTransaction" from the "master account"
