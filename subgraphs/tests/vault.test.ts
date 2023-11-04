import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { FundsUnlocked } from "../generated/schema"
import { FundsUnlocked as FundsUnlockedEvent } from "../generated/Vault/Vault"
import { handleFundsUnlocked } from "../src/vault"
import { createFundsUnlockedEvent } from "./vault-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let amount = BigInt.fromI32(234)
    let forVotes = BigInt.fromI32(234)
    let editionSize = BigInt.fromI32(234)
    let newFundsUnlockedEvent = createFundsUnlockedEvent(
      amount,
      forVotes,
      editionSize
    )
    handleFundsUnlocked(newFundsUnlockedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("FundsUnlocked created and stored", () => {
    assert.entityCount("FundsUnlocked", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FundsUnlocked",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amount",
      "234"
    )
    assert.fieldEquals(
      "FundsUnlocked",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "forVotes",
      "234"
    )
    assert.fieldEquals(
      "FundsUnlocked",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "editionSize",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
