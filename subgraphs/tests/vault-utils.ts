import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { FundsUnlocked, TestingData, Voted } from "../generated/Vault/Vault"

export function createFundsUnlockedEvent(
  amount: BigInt,
  forVotes: BigInt,
  editionSize: BigInt
): FundsUnlocked {
  let fundsUnlockedEvent = changetype<FundsUnlocked>(newMockEvent())

  fundsUnlockedEvent.parameters = new Array()

  fundsUnlockedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  fundsUnlockedEvent.parameters.push(
    new ethereum.EventParam(
      "forVotes",
      ethereum.Value.fromUnsignedBigInt(forVotes)
    )
  )
  fundsUnlockedEvent.parameters.push(
    new ethereum.EventParam(
      "editionSize",
      ethereum.Value.fromUnsignedBigInt(editionSize)
    )
  )

  return fundsUnlockedEvent
}

export function createTestingDataEvent(
  _nftContract: Address,
  tokenId: BigInt,
  description: string,
  isPositive: boolean,
  signal: Address,
  root: BigInt,
  nullifierHash: BigInt,
  proof: Array<BigInt>
): TestingData {
  let testingDataEvent = changetype<TestingData>(newMockEvent())

  testingDataEvent.parameters = new Array()

  testingDataEvent.parameters.push(
    new ethereum.EventParam(
      "_nftContract",
      ethereum.Value.fromAddress(_nftContract)
    )
  )
  testingDataEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  testingDataEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )
  testingDataEvent.parameters.push(
    new ethereum.EventParam(
      "isPositive",
      ethereum.Value.fromBoolean(isPositive)
    )
  )
  testingDataEvent.parameters.push(
    new ethereum.EventParam("signal", ethereum.Value.fromAddress(signal))
  )
  testingDataEvent.parameters.push(
    new ethereum.EventParam("root", ethereum.Value.fromUnsignedBigInt(root))
  )
  testingDataEvent.parameters.push(
    new ethereum.EventParam(
      "nullifierHash",
      ethereum.Value.fromUnsignedBigInt(nullifierHash)
    )
  )
  testingDataEvent.parameters.push(
    new ethereum.EventParam(
      "proof",
      ethereum.Value.fromUnsignedBigIntArray(proof)
    )
  )

  return testingDataEvent
}

export function createVotedEvent(
  voter: Address,
  tokenId: BigInt,
  description: string,
  nulllifierHash: BigInt,
  isFor: boolean
): Voted {
  let votedEvent = changetype<Voted>(newMockEvent())

  votedEvent.parameters = new Array()

  votedEvent.parameters.push(
    new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter))
  )
  votedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  votedEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )
  votedEvent.parameters.push(
    new ethereum.EventParam(
      "nulllifierHash",
      ethereum.Value.fromUnsignedBigInt(nulllifierHash)
    )
  )
  votedEvent.parameters.push(
    new ethereum.EventParam("isFor", ethereum.Value.fromBoolean(isFor))
  )

  return votedEvent
}
