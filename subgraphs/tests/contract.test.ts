import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { DropCreated } from "../generated/schema"
import { DropCreated as DropCreatedEvent } from "../generated/Contract/Contract"
import { handleDropCreated } from "../src/contract"
import { createDropCreatedEvent } from "./contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let creator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let dropAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let vaultAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let editionSize = BigInt.fromI32(234)
    let metadataContractURI = "Example string value"
    let newDropCreatedEvent = createDropCreatedEvent(
      creator,
      dropAddress,
      vaultAddress,
      editionSize,
      metadataContractURI
    )
    handleDropCreated(newDropCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DropCreated created and stored", () => {
    assert.entityCount("DropCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DropCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "creator",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "DropCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "dropAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "DropCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "vaultAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "DropCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "editionSize",
      "234"
    )
    assert.fieldEquals(
      "DropCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "metadataContractURI",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
