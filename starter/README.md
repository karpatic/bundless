# Bundless starter

This starter keeps React components in separate files and serves them directly.

From a fresh copy of this folder:

```sh
npm init -y
npm install --save-exact bundlessdev@1.0.12
mkdir -p vendor
cp node_modules/bundlessdev/dist/bundless.acorn.min.js vendor/bundless.acorn.min.js
npx http-server . -c-1
```

Open the HTTP address printed by the server. The relative `./vendor/` and
`./components/` URLs keep working if this folder is published below a host path,
such as `https://example.com/demos/bundless/`.
