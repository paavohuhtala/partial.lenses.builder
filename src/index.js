
import * as R from "ramda"
import * as PL from "partial.lenses"

const builderSymbol = Symbol("LensBuilder")

const lensBuilder = (props = []) => {
  return new Proxy({}, {
    get: (obj, k) => {
      if (k === builderSymbol) return true
      if (k === '_') return props
      return lensBuilder(R.append(k, props))
    }
  })
}

export const LB = lensBuilder()

const liftedFunctions = [
  "get",
  "set",
  "modify",
  "remove",
  "transform",
  "lazy",
  "toFunction"
]

export const liftL = f => (lensOrBuilder, ...args) => {
  if (lensOrBuilder[builderSymbol]) {
    return f(lensOrBuilder._, ...args)
  }
  return f(lensOrBuilder, ...args)
}

const LiftedL = R.merge(PL, R.pipe(
  R.pick(liftedFunctions),
  R.map(liftL)
)(PL))

export const L = LiftedL
export default LB
