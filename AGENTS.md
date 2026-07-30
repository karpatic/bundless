# Bundless Agent Notes

- Keep the custom `window.import()` module cache keyed by the normalized original module URL. Concurrent and repeated imports for the same key must share one pending promise and one resolved module, failed imports must be evicted so retries refetch, and cache-busting query strings must remain part of the key.
- Acorn/Meriyah source-map behavior is intentional: `.dev.js` variants include runtime inline source maps for debugging, while default/min and explicit `.prod.js` variants omit runtime source maps to avoid production size and runtime overhead. Do not flatten this distinction unless Carlos explicitly changes the policy, and describe Babel/Sucrase behavior separately and accurately.
- Release prep must bump `package.json` and `package-lock.json` together, rebuild all checked-in `dist/*.js` and `dist/*.js.br` variants from source, run `npm test`, run `npm pack --dry-run`, and commit the regenerated artifacts before tagging.
