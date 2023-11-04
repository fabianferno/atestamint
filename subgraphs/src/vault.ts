import {
  FundsUnlocked as FundsUnlockedEvent,
  TestingData as TestingDataEvent,
  Voted as VotedEvent
} from "../generated/Vault/Vault"
import { FundsUnlocked, TestingData, Voted } from "../generated/schema"

export function handleFundsUnlocked(event: FundsUnlockedEvent): void {
  let entity = new FundsUnlocked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.amount = event.params.amount
  entity.forVotes = event.params.forVotes
  entity.editionSize = event.params.editionSize

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTestingData(event: TestingDataEvent): void {
  let entity = new TestingData(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._nftContract = event.params._nftContract
  entity.tokenId = event.params.tokenId
  entity.description = event.params.description
  entity.isPositive = event.params.isPositive
  entity.signal = event.params.signal
  entity.root = event.params.root
  entity.nullifierHash = event.params.nullifierHash
  entity.proof = event.params.proof

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoted(event: VotedEvent): void {
  let entity = new Voted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.voter = event.params.voter
  entity.tokenId = event.params.tokenId
  entity.description = event.params.description
  entity.nulllifierHash = event.params.nulllifierHash
  entity.isFor = event.params.isFor

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
