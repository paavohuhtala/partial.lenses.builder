
# partial.lenses.builder

Alternative syntax for constructing simple [`partial.lenses`](https://github.com/calmm-js/partial.lenses) more succinctly in a (somewhat) TypeScript-compatible manner, using ES2015 [Proxy](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects.

This is just a prototype; I've not even used it beyond simple experimentation.

This is what it looks like:

```js
    import L  from "partial.lenses"
    import LB from "partial.lenses.builder"

    const products = [
      {
        id: 1,
        name: "SuperCool 9001",
        dimensions: { width: 1.5, height: 2.5, weight: 400 }
      },
      {
        id: 2,
        name: "AlmostAsCool 9000",
        dimensions: { width: 1.2, height: 1.9, weight: 370 }
      }
    ]

    // Equivalent to [0, "dimensions", "weight"]
    const product1WeightL = LB[0].dimensions.weight._
    // Equivalent to [1, "name"]
    const product2NameL = LB[1].name._

    // Works with normal partial.lenses functions
    let modifiedProducts = L.modify(product1WeightL, x => x + 1, products)
    modifiedProducts = L.set(product2NameL, "TheCoolest 9002", modifiedProducts)

    // Can be composed with L.compose or array spread operator
    const product2L = LB[1]._
    const productWeightL = LB.dimensions.weight._
    const product2WeightL = [...product2L, ...productWeightL]
    L.get(product2WeightL, products)
```

Additionally, you can avoid the `_` by importing an augmented ("lifted") version of `L` from this module.

```js
  import { LB, L } from "partial.lenses.builder"

  // (using the same data as before)
  L.get(LB[0].dimensions.weight, products)
  L.set(LB[1].id, 12e10, products)
```

The implementation is under 10 lines of code, see [`index.js`](src/index.js).

This is not very usable yet and it's not available for NPM. Still, you can compile it to ES5 with `yarn build` / `npm build` and run the tests with `yarn test` / `npm test`. 

## Why use this?

* I prefer the look of it. It looks almost identical to direct property access,  which some may prefer.
* It reduces the (already very small) syntactical boilerplate to a minimum.
* It can be made to work with TypeScript; more on that later.

## Why not use this?

* It uses ES6/2015 proxy objects. This means a couple of things:
  * According to [Can I use?](http://caniuse.com/proxy) it is supported in somewhere between 70% - 85% of browsers, depending on the country. Unlike most other JS features, it is practically impossible to polyfill perfectly in older browsers. This might or might not be a problem.
  * I haven't benchmarked the performance yet, but it could be an [issue](http://thecodebarbarian.com/thoughts-on-es6-proxies-performance.html). Lens construction has some additional overhead, but after that performance is equivalent to `partial.lenses`. In theory a sufficiently smart JS runtime could prove that the calls to the recursive proxy constructor function could be replaced with an array, but that probably isn't the case.
  * I have a feeling both of the aforementioned issues could be fixed with a simple [Babel plugin](https://babeljs.io/docs/plugins/#plugin-development).
* Maybe you just prefer the array syntax. I'm not going to hold it against you.

## TypeScript support

The biggest advantage with this syntax is that it's compatible with TypeScript. Well, somewhat.

When `Lens<TObj, TValue>` is the type definition for a `partial.lenses` lens, a TypeScript wrapper could look something like this:

```typescript
type LensBuilder<TRoot, T> = {
  [P in keyof T]: LensBuilder<TRoot, T[P]> & { _: Lens<TRoot, T[P]> }
}

function lensBuilder<T>(): LensBuilder<T, T> {
  return <LensBuilder<T, T>> LB;
}
```

Which can then be used like this:

```typescript
interface Product {
  id: number,
  name: string,
  dimensions: { width: number, height: number, weight: number }
}

const product = {
  id: 1,
  name: "SuperCool 9001",
  dimensions: { width: 1.5, height: 2.5, weight: 400 }
}

const PLB = lensBuilder<Product>()
L.get(PLB.id._, product)
```

This doesn't just compile, it actually provides autocompletion in editors with TS support. However, there is a notable limitation: it doesn't support array indexing. I'm not entirely sure about the exact reason why, but I think it has something to do with `keyof` only returning named properties. Interestingly enough, it works just fine with tuple-like arrays of statically known length.

Full support would most likely require [conditional mapped types](https://github.com/Microsoft/TypeScript/issues/12424) which unfortunately aren't even on the roadmap yet.

I have built an **ugly** workaround which can handle an array as the first "step" of the lens, but afterwards it only understands props. I wouldn't necessarily recommend using it.

```typescript
interface ILensBuilderIndexer<TRoot, T extends TItem[], TItem> {
  _: Lens<TRoot, TRoot>,
  [index: number]: LensBuilder<TRoot, T[number]> & { _: Lens<TRoot, T[number]> }
}

function _lensBuilderA<TItem, TArr extends TItem[]>() : LensBuilder<TArr, TArr> & ILensBuilderIndexer<TArr, TArr, TItem> {
  return <LensBuilder<TArr, TArr> & ILensBuilderIndexer<TArr, TArr, TItem>> lensBuilder<TArr>()
}

function lensBuilderA<TItem>() { return _lensBuilderA<TItem, TItem[]>() }
// Used just like above, except it can now handle the original example.
```
(I kinda just threw type annotations at it until it stopped erroring)

## License

Licensed under the [MIT license](/license.md).
