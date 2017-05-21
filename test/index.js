import * as R from "ramda"
import * as L from "partial.lenses"
import { L as LiftedL, LB } from "../dist/index"
import * as assert from "assert"

describe("lens converter (_)", () => {
  it("should return identity lens when chain is empty", () => {
    const testData = { x: 10 }
    assert.equal(10, L.get(LB._, testData).x)
  })

  it("should get properties", () => {
    const testData = { x: 10, y: 20 }
    assert.equal(10, L.get(LB.x._, testData))
    assert.equal(20, L.get(LB.y._, testData))
  })

  it("should set properties", () => {
    const testData = { x: 10, y: 20 }
    assert.equal(15, L.set(LB.x._, 15, testData).x)
    assert.equal("huh", L.set(LB.y._, "huh", testData).y)
  })

  it("should get indices", () => {
    const testData = ["hello", "world", 666, 1337]
    assert.equal("hello", L.get(LB[0]._, testData))
    assert.equal(666, L.get(LB[2]._, testData))
  })

  it("should set indices", () => {
    const testData = ["hello", "world", 666, 1337]
    assert.equal(-1, L.set(LB[0]._, -1, testData)[0])
    assert.equal(10e6, L.set(LB[2]._, 10e6, testData)[2])
  })

  it("should get nested properties", () => {
    const first = { second: { third: { x: 10 } } }
    assert.equal(10, L.get(LB.second.third.x._, first))
  })

  it("should set nested properties", () => {
    const first = { second: { third: { x: 10 } } }
    const modified = L.set(LB.second.y._, 3, first)

    assert.equal(3, modified.second.y)
    assert.equal(10, modified.second.third.x)
  })

  it("should be composable with array spread syntax", () => {
    const first = { second: { third: { x: 10 } } }
    const secondL = LB.second._
    const thirdXL = LB.third.x._
    const composed = [...secondL, ...thirdXL]
    assert.equal(10, L.get(composed, first))
  })
})

describe("lifted built-in functions", () => {
  it("should get properties", () => {
    const testData = { x: 10, y: 20 }
    assert.equal(10, LiftedL.get(LB.x, testData))
    assert.equal(20, LiftedL.get(LB.y, testData))
  })

  it("should set properties", () => {
    const testData = { x: 10, y: 20 }
    const modified = R.pipe(
      LiftedL.set(LB.x, 11),
      LiftedL.set(LB.y, 21),
      LiftedL.set(LB.z, true)
    )(testData)

    assert.equal(11, modified.x)
    assert.equal(21, modified.y)
    assert.equal(true, modified.z)
  })

  it("should remove properties", () => {
    const testData = { x: 10, y: 20 }
    const modified = LiftedL.remove(LB.x, testData)
    assert.equal(undefined, modified.x)
    assert.equal(20, modified.y)
  })
})
