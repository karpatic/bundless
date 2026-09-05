import React from "react";
import {
  Callout,
  CodeBlock,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

const installCommand = `
npm install react@18.3.1 react-dom@18.3.1
npm install --save-dev bundlessdev@1.0.12 webpack webpack-cli html-webpack-plugin http-server babel-loader @babel/core @babel/preset-env @babel/preset-react
npm pkg set scripts.build="webpack --config webpack.config.cjs --mode production"
npm pkg set scripts.serve="http-server dist -c-1"
`;

const webpackConfig = `
const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundlessWebpackPlugin = require("bundlessdev/webpack");

module.exports = {
  mode: "production",
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.[contenthash].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./index.html" }),
    new BundlessWebpackPlugin({
      include: path.resolve(__dirname, "src"),
      prefetch: "webpack",
      stripHtmlRuntime: true,
    }),
  ],
};
`;

const htmlTemplate = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Built React app</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;

const entryFile = `
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
`;

const appFile = `
export default function App() {
  return <h1>The Webpack build works.</h1>;
}
`;

const buildCommands = `
npm run build
npm run serve
`;

const typeCheckCommands = `
npm install --save-dev typescript @types/react @types/react-dom
npx tsc --noEmit
`;

const wrapperExample = `
const { bundlessWebpack } = require("bundlessdev/webpack");

module.exports = bundlessWebpack(
  {
    entry: "./src/index.jsx",
    plugins: [],
  },
  {
    include: /src/,
    prefetch: "webpack",
  }
);
`;

const loaderExample = `
module.exports = {
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\\.[cm]?[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "bundlessdev/webpack/loader",
          options: {
            prefetch: "webpack",
            parserPlugins: [],
          },
        },
      },
      // Add a separate JSX or TypeScript loader here.
    ],
  },
};
`;

export default function MigrationPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Migration" title="Move browser compilation to Webpack">
        Keep supported application calls. Move JSX or TypeScript compilation and dependency output into a build.
      </PageHeader>

      <h2>Move when the application needs a build</h2>
      <p>
        Add Webpack when you need strict CSP, required type checks, production chunks, optimized
        assets, or controlled dependency output. Webpack resolves modules before deployment.
        Bundless no longer transforms application source in the browser.
      </p>

      <h2>1. Install the build tools</h2>
      <CodeBlock code={installCommand} />
      <p>
        React and ReactDOM become application dependencies instead of CDN imports. This example uses
        Babel for JSX and pins the Bundless integration used by the migration.
      </p>

      <h2>2. Create{" "}<code>webpack.config.cjs</code></h2>
      <CodeBlock code={webpackConfig} />
      <p>
        The Bundless plugin adds its loader as a pre-loader. That loader rewrites supported calls.
        It does not transpile JSX or TypeScript. The separate Babel rule does the syntax transform.
      </p>

      <h2>3. Create the template and application entry</h2>
      <h3><code>index.html</code></h3>
      <CodeBlock code={htmlTemplate} />
      <h3><code>src/index.jsx</code></h3>
      <CodeBlock code={entryFile} />
      <h3><code>src/App.jsx</code></h3>
      <CodeBlock code={appFile} />
      <p>
        Move the rest of the source out of <code>text/jsx</code> or <code>text/babel</code> tags and
        keep its package and local imports. Webpack now resolves them.
      </p>

      <h2>4. Remove the browser-only path</h2>
      <p>Delete these items from the HTML template after the built entry renders correctly:</p>
      <ul>
        <li>React and ReactDOM CDN script tags.</li>
        <li>The React import map, including <code>react-dom/client</code> mappings.</li>
        <li>Bundless runtime tags and application <code>text/jsx</code> tags.</li>
        <li>Declarative Bundless prefetch JSON unless it is deliberately preserved as data.</li>
      </ul>
      <p>
        HtmlWebpackPlugin injects the emitted application bundle. The Bundless plugin removes
        recognized browser-runtime tags from generated HTML when <code>stripHtmlRuntime</code> is enabled.
      </p>

      <h2>5. Build and serve the production output</h2>
      <CodeBlock code={buildCommands} />
      <p>Open the printed URL and verify the rendered application from <code>dist/</code>.</p>
      <p>
        <a href="https://github.com/karpatic/bundless/tree/main/examples/webpack-migration">Browse the complete migration example.</a>
      </p>

      <h2>6. Keep TypeScript checking explicit</h2>
      <p>
        The configuration above compiles JavaScript and JSX. The Bundless pre-loader can parse and
        rewrite supported TypeScript source calls, but it never type-checks them. For a TS or TSX
        migration, add the project’s normal TypeScript loader or compiler configuration and keep an
        explicit check in local and CI commands, for example:
      </p>
      <CodeBlock code={typeCheckCommands} />
      <p>
        Passing the Webpack build proves that syntax and modules compiled; it does not prove that
        TypeScript types are correct unless a type checker ran.
      </p>

      <h2>Understand each part</h2>
      <h3>Plugin</h3>
      <p>
        <code>BundlessWebpackPlugin</code> adds the pre-loader, aliases Bundless browser runtimes out
        of the bundle by default, and can remove Bundless tags from HtmlWebpackPlugin output.
      </p>
      <h3>Loader</h3>
      <p>
        The loader parses source and rewrites supported <code>window.import()</code> and
        <code>window.Bundless.prefetch()</code> calls. It does not compile JSX or TypeScript.
      </p>
      <h3>Application compiler</h3>
      <p>
        Babel, SWC, esbuild, or TypeScript compiles the application syntax. Keep this compiler in a
        separate Webpack rule.
      </p>

      <h2>Know how source calls change</h2>
      <ul>
        <li>
          <code>window.import(argument)</code> becomes native <code>import(argument)</code> when
          <code>window</code> is not a local binding. The argument then follows Webpack dynamic-import rules.
        </li>
        <li>
          With <code>prefetch: "webpack"</code>, a literal string or literal string-array becomes
          one or more Webpack prefetch imports.
        </li>
        <li>
          A dynamic or unsupported prefetch argument becomes <code>Promise.resolve()</code> and adds no hint.
          In a mixed array, only literal string items make hints.
        </li>
        <li>
          With <code>prefetch: "noop"</code>, every supported prefetch call becomes
          <code>Promise.resolve()</code> and adds no hint.
        </li>
        <li>
          If source declares a local <code>window</code> binding, the loader leaves these calls unchanged.
        </li>
      </ul>

      <Callout title="Keep dynamic imports within Webpack limits">
        <p>
          A nonliteral dynamic-import argument can create a Webpack context or fail to resolve the
          intended files. Use literal split points when you need predictable chunks.
        </p>
      </Callout>

      <h2>Know how generated HTML changes</h2>
      <p>
        With <code>stripHtmlRuntime: true</code> and HtmlWebpackPlugin, the plugin removes Bundless
        runtime tags and browser source-script tags. It also removes declarative prefetch JSON. A
        JSON block does not become a Webpack prefetch hint.
      </p>
      <p>
        Add <code>data-webpack-ignore</code> to preserve a declarative prefetch block. This attribute
        does not preserve a Bundless runtime tag or a JSX source tag. If the project does not use
        HtmlWebpackPlugin, the plugin does not edit HTML.
      </p>

      <h2>Configure the plugin</h2>
      <h3><code>loader</code></h3>
      <p>Default: enabled. Set it to <code>false</code> to stop the plugin from adding the Bundless pre-loader.</p>

      <h3><code>test</code></h3>
      <p>Default: <code>/\.[cm]?[jt]sx?$/</code>. Set the files that the pre-loader can parse.</p>

      <h3><code>include</code></h3>
      <p>No default. Set a path or condition to limit the pre-loader to application source.</p>

      <h3><code>exclude</code></h3>
      <p>Default: <code>/node_modules/</code>. Set files that the pre-loader must not parse.</p>

      <h3><code>parserPlugins</code></h3>
      <p>
        Default: no additions. Add Babel parser plugin names for syntax that the built-in parser list
        does not cover. TypeScript parsing is added automatically for TypeScript file extensions.
      </p>

      <h3><code>prefetch</code></h3>
      <p>
        Default: <code>"webpack"</code>. Use <code>"noop"</code> to keep resolved-promise behavior
        without Webpack prefetch hints.
      </p>

      <h3><code>runtime</code></h3>
      <p>
        Default: <code>false</code>. The plugin aliases known Bundless runtime imports to
        <code>false</code>. Set it to another value to keep runtime imports in the bundle.
      </p>

      <h3><code>runtimeAliases</code></h3>
      <p>
        Default: the known <code>bundlessdev</code> runtime package paths. When
        <code>runtime</code> is <code>false</code>, supply a replacement alias object for custom
        runtime paths.
      </p>

      <h3><code>stripHtmlRuntime</code></h3>
      <p>
        Default: <code>true</code>. Set it to <code>false</code> to keep Bundless tags in
        HtmlWebpackPlugin output.
      </p>

      <h2>Use the public exports</h2>
      <h3><code>BundlessWebpackPlugin</code></h3>
      <p>
        <code>require("bundlessdev/webpack")</code> returns the plugin constructor. It also exports
        the constructor as <code>BundlessWebpackPlugin</code>.
      </p>

      <h3><code>bundlessWebpack(config, options)</code></h3>
      <p>Use the helper to append the plugin to an existing configuration.</p>
      <CodeBlock code={wrapperExample} />

      <h3><code>bundlessdev/webpack/loader</code></h3>
      <p>Use the loader export directly if you do not want plugin coordination.</p>
      <CodeBlock code={loaderExample} />

      <DemoLinks>
        <DemoLink href="/usage.html">Back to usage</DemoLink>
        <DemoLink href="/docs/troubleshooting.html" secondary>Open troubleshooting</DemoLink>
      </DemoLinks>
    </div>
  );
}
