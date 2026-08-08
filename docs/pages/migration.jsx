import React from "react";
import {
  Callout,
  CodeBlock,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

const installCommand = `
npm install --save-dev bundlessdev webpack webpack-cli html-webpack-plugin babel-loader @babel/core @babel/preset-react
`;

const webpackConfig = `
const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundlessWebpackPlugin = require("bundlessdev/webpack");

module.exports = {
  entry: "./src/index.jsx",
  module: {
    rules: [
      {
        test: /\\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/preset-react"] },
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
        This example uses Babel for JSX. Use the normal SWC, esbuild, or TypeScript loader instead if
        that is the compiler for the project.
      </p>

      <h2>2. Create the Webpack configuration</h2>
      <CodeBlock code={webpackConfig} />
      <p>
        The Bundless plugin adds its loader as a pre-loader. That loader rewrites supported calls.
        It does not transpile JSX or TypeScript. The separate Babel rule does the syntax transform.
      </p>

      <h2>3. Move application startup into the entry</h2>
      <ol>
        <li>Move code from <code>text/jsx</code> or <code>text/babel</code> tags into <code>./src/index.jsx</code> and imported files.</li>
        <li>Keep package and local imports in the source files. Webpack now resolves them.</li>
        <li>Let HtmlWebpackPlugin add the output bundle to generated HTML.</li>
        <li>Build and verify the rendered application before you remove the old browser path.</li>
      </ol>

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
