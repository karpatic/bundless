import React from "react";
import {
  Callout,
  CodeBlock,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

const webpackConfig = `
const path = require("node:path");
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
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
    ],
  },
  plugins: [
    new BundlessWebpackPlugin({
      include: path.resolve(__dirname, "src"),
      prefetch: "webpack",
      stripHtmlRuntime: true,
    }),
  ],
};
`;

export default function MigrationPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Migration" title="Move a Bundless page to Webpack">
        Keep your React files and add a build when runtime transformation is no longer the right fit.
      </PageHeader>

      <h2>What changes</h2>
      <p>
        Bundless runs in the browser. Webpack runs before deploy. After migration, Webpack resolves
        imports, builds chunks, and loads the app bundle. Your JSX or TypeScript loader still does
        the normal syntax transform.
      </p>

      <h2>Practical config</h2>
      <CodeBlock code={webpackConfig} />

      <h2>Migration checklist</h2>
      <ol>
        <li>Create a normal Webpack entry such as <code>./src/index.jsx</code>.</li>
        <li>Keep your Babel, SWC, esbuild, or TypeScript loader for JSX and TSX.</li>
        <li>Add <code>new BundlessWebpackPlugin()</code> to <code>plugins</code>.</li>
        <li>Move app code out of browser source script tags and into the Webpack entry.</li>
        <li>Remove Bundless runtime tags from production HTML, or let HtmlWebpackPlugin stripping handle them.</li>
        <li>Replace HTML prefetch JSON with source-level <code>window.Bundless.prefetch()</code> calls when you want Webpack prefetch hints.</li>
      </ol>

      <h2>What happens to Bundless calls</h2>
      <p>
        Literal <code>window.import("./Dialog.jsx")</code> calls become native dynamic
        <code>import("./Dialog.jsx")</code> calls, so Webpack owns chunk loading. Literal
        <code>window.Bundless.prefetch("./Dialog.jsx")</code> calls can become Webpack prefetch
        hints when <code>prefetch: "webpack"</code> is enabled.
      </p>

      <h2>Normal options</h2>
      <p>
        Use <code>include</code> to limit the source files the plugin scans. Keep
        <code>stripHtmlRuntime: true</code> when HtmlWebpackPlugin should remove Bundless browser
        tags from generated HTML. Use <code>prefetch: "noop"</code> if you want the promise shape
        without Webpack prefetch hints.
      </p>

      <Callout title="Know the limit">
        <p>
          Dynamic import arguments that are not literal strings follow Webpack's normal dynamic
          import limits. Keep split points literal when you want clear chunks.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/usage.html">Back to Usage Docs</DemoLink>
        <DemoLink href="/playground.html" secondary>Open Playground</DemoLink>
      </DemoLinks>
    </div>
  );
}
