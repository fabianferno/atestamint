import {
  DropCreated as DropCreatedEvent,
  EditionCreated as EditionCreatedEvent
} from "../generated/Contract/Contract"
import { DropCreated, EditionCreated } from "../generated/schema"

export function handleDropCreated(event: DropCreatedEvent): void {
  let entity = new DropCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.dropAddress = event.params.dropAddress
  entity.vaultAddress = event.params.vaultAddress
  entity.editionSize = event.params.editionSize
  entity.metadataContractURI = event.params.metadataContractURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEditionCreated(event: EditionCreatedEvent): void {
  let entity = new EditionCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.editionAddress = event.params.editionAddress
  entity.vaultAddress = event.params.vaultAddress
  entity.editionSize = event.params.editionSize
  entity.metadataContractURI = event.params.metadataContractURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
