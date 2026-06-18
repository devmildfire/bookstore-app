// No-op stub for next/dist/compiled/next-devtools.
//
// Next.js 16's webpack production builder bundles the ~228 KB (gz) dev-overlay /
// devtools into the CLIENT production bundle, where it is dead code (gated to dev)
// but still shipped. We alias the compiled module to this no-op so it never reaches
// users. Permissive Proxy so any default/named import resolves to a callable no-op.
const noop = function () {}
const handler = {
  get(_target, prop) {
    if (prop === '__esModule') return true
    if (prop === 'default') return proxy
    return proxy
  },
  apply() {},
  construct() {
    return {}
  },
}
const proxy = new Proxy(noop, handler)
module.exports = proxy
