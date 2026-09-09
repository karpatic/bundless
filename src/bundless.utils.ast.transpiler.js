// Extract debug properties correctly
// debug { sourceFilename, toEncodedMap }
function transformAST(ast, debug = {}) {
  let indent = 0;
  const spacing = "  ";

  function transformJSXName(node) {
    if (node.type === "JSXIdentifier") {
      return node.name;
    }
    if (node.type === "JSXMemberExpression") {
      return `${transformJSXName(node.object)}.${transformJSXName(node.property)}`;
    }
    if (node.type === "JSXNamespacedName") {
      return `${transformJSXName(node.namespace)}:${transformJSXName(node.name)}`;
    }
    return transformNode(node);
  }

  function transformJSXTagName(node) {
    const name = transformJSXName(node);
    return node.type === "JSXIdentifier" && name[0] === name[0].toLowerCase()
      ? JSON.stringify(name)
      : name;
  }

  function transformPropertyKey(node) {
    if (node.computed) {
      return `[${transformNode(node.key)}]`;
    }
    if (node.key.type === "Identifier") {
      return node.key.name;
    }
    return node.key.raw ?? JSON.stringify(node.key.value);
  }

  function transformJSXChildren(children) {
    return children.map(transformNode).filter(Boolean);
  }

  function getOriginalSource(node) {
    if (typeof debug.code !== "string" ||
        !Number.isInteger(node.start) ||
        !Number.isInteger(node.end)) {
      throw new TypeError(`Bundless cannot preserve source for ${node.type}.`);
    }
    return debug.code.slice(node.start, node.end);
  }

  function transformCreateElement(tagName, props, children) {
    if (children.length === 0) {
      return `React.createElement(${tagName}, ${props})`;
    }
    return `React.createElement(${tagName}, ${props},\n${children
      .map((child) => `${getIndent()}${spacing}${child}`)
      .join(",\n")})`;
  }

  function getIndent() {
    return spacing.repeat(indent);
  }

  function transformNode(node) {
    // Process the node and prepare for source mapping
    if (!node) {
      return "";
    }

    let result = "";

    switch (node.type) {
      case "TryStatement":
        const tryBlock = transformNode(node.block);
        const catchClause = node.handler ? transformNode(node.handler) : "";
        const finalizer = node.finalizer ? transformNode(node.finalizer) : "";
        result = `try ${tryBlock} ${catchClause} ${
          finalizer ? `finally ${finalizer}` : ""
        }`;
        break;
      case "ForStatement":
        const init = transformNode(node.init);
        const test = transformNode(node.test);
        const update = transformNode(node.update);
        const forBody = transformNode(node.body);
        result = `for (${init ?? ''}${init?.endsWith(';') ? '' : ';'} ${test ?? ''}; ${update ?? ''}) ${forBody}`;
        break;
      case "ForOfStatement": {
        const left = transformNode(node.left).replace(/;$/, "");
        result = `for ${node.await ? "await " : ""}(${left} of ${transformNode(node.right)}) ${transformNode(node.body)}`;
        break;
      }
      case "WhileStatement":
        result = `while (${transformNode(node.test)}) ${transformNode(node.body)}`;
        break;
      case "UpdateExpression":
        result = node.prefix
          ? `(${node.operator}${transformNode(node.argument)})`
          : `(${transformNode(node.argument)}${node.operator})`;
        break;
      case "CatchClause":
        const param = node.param ? transformNode(node.param) : "";
        const catchBody = transformNode(node.body);
        result = param ? `catch (${param}) ${catchBody}` : `catch ${catchBody}`;
        break;
      case "Literal":
        result = node.raw ?? JSON.stringify(node.value);
        break;
      case "Identifier":
        result = node.name;
        break;
      case "UnaryExpression":
        result = `(${node.operator} ${transformNode(node.argument)})`;
        break;
      case "Program":
        result = node.body.map(transformNode).join("\n\n");
        break;
      case "ExpressionStatement":
        result = `${getIndent()}${transformNode(node.expression)};`;
        break;
      case "ReturnStatement":
        result = `return ${transformNode(node.argument)};`;
        break;
      case "ExportDefaultDeclaration":
        result = `export default ${transformNode(node.declaration)};`;
        break;
      case "ImportSpecifier":
        result = node.imported.name;
        break;
      case "ImportDefaultSpecifier":
        result = node.local.name;
        break;
      case "ImportExpression":
        result = getOriginalSource(node);
        break;
      case "AssignmentExpression": {
        result = `(${transformNode(node.left)} ${node.operator} ${transformNode(
          node.right
        )})`;
        break;
      }
      case "SpreadElement":
        result = `...${transformNode(node.argument)}`;
        break;
      case "LogicalExpression":
        result = `(${transformNode(node.left)} ${node.operator} ${transformNode(
          node.right
        )})`;
        break;
      case "ChainExpression":
        result = `(${transformNode(node.expression)})`;
        break;
      case "JSXFragment":
        indent++;
        const fragmentChildren = transformJSXChildren(node.children);
        indent--;
        result = transformCreateElement("React.Fragment", "null", fragmentChildren);
        break;
      case "JSXExpressionContainer":
        result = transformNode(node.expression);
        break;
      case "JSXEmptyExpression":
        result = "";
        break;
      case "NewExpression":
        result = `new ${transformNode(node.callee)}(${node.arguments
          .map(transformNode)
          .join(", ")})`;
        break;
      case "ThrowStatement":
        result = `throw ${transformNode(node.argument)};`;
        break;
      case "TemplateLiteral":
        result =
          "`" +
          node.quasis
            .map((quasi, i) => {
              const value = quasi.value.raw;
              const expr = node.expressions[i]
                ? "${" + transformNode(node.expressions[i]) + "}"
                : "";
              return value + expr;
            })
            .join("") +
          "`";
        break;
      case "SwitchStatement":
        const discriminant = transformNode(node.discriminant);
        const cases = node.cases
          .map((caseNode) => {
            const test = caseNode.test ? `case ${transformNode(caseNode.test)}` : "default";
            const consequent = caseNode.consequent
              .map(transformNode)
              .join("\n");
            return `${test}:\n${consequent}`;
          })
          .join("\n");
        result = `switch (${discriminant}) {\n${cases}\n}`;
        break;
      case "ImportDeclaration":
        result = getOriginalSource(node);
        break;
      case "FunctionDeclaration":
        const params = node.params
          .map(transformNode)
          .join(", ");
        const body = transformNode(node.body);
        result = `function ${node.id.name}(${params}) ${body}`;
        break;
      case "AwaitExpression":
        result = `(await ${transformNode(node.argument)})`;
        break;
      case "BlockStatement":
        indent++;
        const statements = node.body
          .map((stmt) => `${getIndent()}${transformNode(stmt)}`)
          .join("\n");
        indent--;
        result = `{\n${statements}\n${getIndent()}}`;
        break;
      case "IfStatement":
        const testExpr = transformNode(node.test);
        const consequent = transformNode(node.consequent);
        const alternate = node.alternate
          ? `else ${transformNode(node.alternate)}`
          : "";
        result = `if (${testExpr}) ${consequent} ${alternate}`;
        break;
      case "BreakStatement":
        result = "break;";
        break;
      case "ConditionalExpression":
        const testExprConditional = transformNode(node.test);
        const consequentExpr = transformNode(node.consequent);
        const alternateExpr = transformNode(node.alternate);
        result = `(${testExprConditional} ? ${consequentExpr} : ${alternateExpr})`;
        break;
      case "ExportNamedDeclaration":
        result = node.declaration
          ? `export ${transformNode(node.declaration)}`
          : getOriginalSource(node);
        break;
      case "ExportAllDeclaration":
        result = getOriginalSource(node);
        break;
      case "JSXElement": {
        indent++;
        const tagName = transformJSXTagName(node.openingElement.name);
        const props = node.openingElement.attributes
          .map((attr) => {
            if (attr.type === "JSXSpreadAttribute") {
              return `...${transformNode(attr.argument)}`;
            }
            const name = attr.name.name;
            const value = attr.value ? transformNode(attr.value) : "true";
            if (name.includes("-")) {
              return `'${name}': ${value}`;
            }
            return `${name}: ${value}`;
          })
          .join(", ");
        const children = transformJSXChildren(node.children);
        indent--;
        result = transformCreateElement(tagName, `{${props}}`, children);
        break;
      }
      case "JSXText":
        let text = node.value;
        if (!text.includes("\n")) {
          text = text.trim();
        } else {
          text = text
            .split("\n")
            .map((line) => line.trim())
            .join("\n")
            .trim();
        }
        const escapedText = text.replace(/'/g, "\\'").replace(/\n/g, "\\n");
        result = text ? `'${escapedText}'` : "";
        break;
      case "VariableDeclaration":
        const declarations = node.declarations.map(transformNode).join(", ");
        if (node.kind === "let") {
        }
        result = `${node.kind} ${declarations};`;
        break;
      case "VariableDeclarator":
        if (!node.init) {
          result = transformNode(node.id);
        } else {
          const init = transformNode(node.init);
          result = `${transformNode(node.id)} = ${init}`;
        }
        break;
      case "CallExpression":
        const args = node.arguments.map(transformNode).join(", ");
        result = `(${transformNode(node.callee)}${node.optional ? "?." : ""}(${args}))`;
        break;
      case "ArrowFunctionExpression":
        const arrowParams = node.params
          .map(transformNode)
          .join(", ");
        indent++;
        const arrowBody =
          node.body.type === "BlockStatement"
            ? transformNode(node.body)
            : `{\n${getIndent()}return ${transformNode(
                node.body
              )};\n${getIndent()}}`;
        indent--;
        const asyncKeyword = node.async ? "async " : "";
        result = `(${asyncKeyword}(${arrowParams}) => ${arrowBody})`;
        break;
      case "ObjectExpression":
        const properties = node.properties.map(transformNode).join(", ");
        result = `({${properties}})`;
        break;
      case "Property": {
        if (node.shorthand) {
          result = transformNode(node.value);
        } else {
          result = `${transformPropertyKey(node)}: ${transformNode(node.value)}`;
        }
        break;
      }
      case "ObjectPattern":
        result = `{${node.properties.map(transformNode).join(", ")}}`;
        break;
      case "ArrayPattern":
        result = `[${node.elements.map((element) => element ? transformNode(element) : "").join(", ")}]`;
        break;
      case "AssignmentPattern":
        result = `${transformNode(node.left)} = ${transformNode(node.right)}`;
        break;
      case "RestElement":
        result = `...${transformNode(node.argument)}`;
        break;
      case "BinaryExpression":
        result = `(${transformNode(node.left)} ${node.operator} ${transformNode(
          node.right
        )})`;
        break;
      case "MemberExpression":
        if (node.computed) {
          result = `${transformNode(node.object)}${node.optional ? "?.[" : "["}${transformNode(
            node.property
          )}]`;
        } else {
          const optionalChaining = node.optional ? "?." : ".";
          result = `${transformNode(node.object)}${optionalChaining}${
            node.property.name
          }`;
        }
        break;
      case "ArrayExpression":
        const elements = node.elements.map(transformNode).join(", ");
        result = `[${elements}]`;
        break;
      default:
        throw new TypeError(
          `Bundless AST transformer does not support ${node.type}` +
          (Number.isInteger(node.start) ? ` at source offset ${node.start}.` : ".")
        );
    }

    debug?.updatePosition?.(result, node);
    return result;
  }

  let output = transformNode(ast);
  const sourceMap = debug?.toEncodedMap?.(debug.map);
  return {
    code: output,
    map: sourceMap,
  };
}

function toPreact(code) {
  if (window.Bundless.to == "preact") {
    let prefix;
    prefix = `import { Fragment, h, render } from 'https://esm.sh/preact@10.5.13/es2022/preact.mjs';\n`;
    prefix += `import { useState, useEffect, useRef, useMemo } from 'https://esm.sh/preact@10.5.13/es2022/hooks.mjs';\n`;
    code = code.replace(/React.createElement/g, "h");
    code = code.replace(/ReactDOM.render/g, "render");
    code = code.replace(/React.useState/g, "useState");
    code = code.replace(/React.useEffect/g, "useEffect");
    code = code.replace(/React.useRef/g, "useRef");
    code = code.replace(/React.useMemo/g, "useMemo");
    code = code.replace(/React.Fragment/g, "Fragment");

    code = code.replace(/import\s+[\s\S]*?\s+from ['"]react(?:-dom)?(?:\/[^'"]*)?['"];?\n?/g, "");
    code = prefix + code;
  }
  return code;
}

export { transformAST };
