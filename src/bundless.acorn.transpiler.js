// import "./acorn-jsx.js";
import * as acorn from "./../rsc/acorn.min.mjs";
import acornJsxPlugin from "./../rsc/acorn-jsx.min.mjs";

console.log({ acornJsxPlugin });
 

function transformAST(ast) {
  let indent = 0;
  const spacing = "  ";

  function getIndent() {
    return spacing.repeat(indent);
  }

  function transformNode(node) {
    // console.log('transformNode: ',node);
    if (!node) {
      return "";
    }
    switch (node.type) {
      case "Literal": return node.raw;
      case "Identifier": return node.name;
      case "UnaryExpression": return `${node.operator} ${transformNode(node.argument)}`;
      case "Program": return node.body.map(transformNode).join("\n\n");
      case "ExpressionStatement": return `${getIndent()}${transformNode(node.expression)};`;
      case "ReturnStatement": return `return ${transformNode(node.argument)};`;
      case "ExportDefaultDeclaration": return `export default ${transformNode(node.declaration)}`;
      case "ImportSpecifier": return node.imported.name;
      case "ImportDefaultSpecifier": return node.local.name;
      case "ImportExpression": return `window.import(${transformNode(node.source)})`;
      case "ImportDeclaration":
        const specifiers = node.specifiers
          .map((specifier) => transformNode(specifier))
          .filter(Boolean)
          .join(", ");
        const importSource = node.source ? `'${node.source.value}'` : '';
        if (node.specifiers.some(specifier => specifier.type === 'ImportDefaultSpecifier')) {
          // Handle default import
          const defaultSpecifier = node.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier');
          const localName = defaultSpecifier.local.name;
          return `import ${localName} from ${importSource}`;
        } else if (specifiers) {
          // Handle named imports
          return `import {${specifiers}} from ${importSource}`;
        } else {
          // Handle side-effect imports (no specifiers)
          return `import ${importSource}`;
        } 

      case "FunctionDeclaration":
        const params = node.params
          .map((param) => {
            if (param.type === "ObjectPattern") {
              const props = param.properties.map((p) => p.key.name).join(", ");
              return `{${props}}`;
            }
            return param.name;
          })
          .join(", ");
        const body = transformNode(node.body);
        return `function ${node.id.name}(${params}) ${body}`;

      case "AwaitExpression":
        return `await ${transformNode(node.argument)}`;

      case "BlockStatement":
        indent++;
        const statements = node.body
          .map((stmt) => `${getIndent()}${transformNode(stmt)}`)
          .join("\n");
        indent--;
        return `{\n${statements}\n${getIndent()}}`;

      case "IfStatement":
        const test = transformNode(node.test);
        const consequent = transformNode(node.consequent);
        const alternate = node.alternate
          ? `else ${transformNode(node.alternate)}`
          : "";
        return `if (${test}) ${consequent} ${alternate}`;

      case "ConditionalExpression":
        const testExpr = transformNode(node.test);
        const consequentExpr = transformNode(node.consequent);
        const alternateExpr = transformNode(node.alternate);
        return `${testExpr} ? ${consequentExpr} : ${alternateExpr}`;
 

      case "ExportNamedDeclaration":
        console.log("ExportNamedDeclaration", node);
        return `export ${transformNode(node.declaration)}`;

      case "JSXElement": {
        indent++;
        const name = node.openingElement.name.name;
        // Check if component (starts with uppercase) or HTML element
        const tagName =
          name[0] === name[0].toUpperCase()
            ? name // Component - pass name directly
            : `'${name}'`; // HTML element - pass as string

        const props = node.openingElement.attributes
          .map((attr) => {
            const name = attr.name.name;
            const value = transformNode(attr.value);
            // Keep event handler props in camelCase
            return `${name}: ${value}`;
          })
          .join(", ");

        const children = node.children
          .map((child) => transformNode(child))
          .filter(Boolean);

        indent--;

        if (children.length === 0) {
          return `React.createElement(${tagName}, {${props}})`;
        }

        return `React.createElement(${tagName}, {${props}},\n${children
          .map((child) => `${getIndent()}${spacing}${child}`)
          .join(",\n")})`;
      }

      case "JSXText":
        const text = node.value.trim();
        return text ? `'${text}'` : "";

      case "JSXExpressionContainer":
        return transformNode(node.expression);

      case "VariableDeclaration":
        const declarations = node.declarations.map(transformNode).join(", ");
        return `${node.kind} ${declarations};`;

      case "VariableDeclarator":
        const init = transformNode(node.init);
        if (node.id.type === "ArrayPattern") {
          const elements = node.id.elements.map((el) => el.name).join(", ");
          return `[${elements}] = ${init}`;
        }
        return `${node.id.name} = ${init}`;

      case "CallExpression":
        if (node.callee.type === "MemberExpression") {
          const object = transformNode(node.callee.object);
          const property = node.callee.property.name;
          const args = node.arguments.map(transformNode).join(", ");
          return `${object}.${property}(${args})`;
        }
        const args = node.arguments.map(transformNode).join(", ");
        return `${transformNode(node.callee)}(${args})`;

        case "ArrowFunctionExpression":
          const arrowParams = node.params
            .map((param) => {
              if (param.type === "ObjectPattern") {
                const props = param.properties.map((p) => p.key.name).join(", ");
                return `{${props}}`;
              } else if (param.type === "AssignmentPattern") {
                const left = transformNode(param.left);
                const right = transformNode(param.right);
                return `${left} = ${right}`;
              }
              return param.name;
            })
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
          return `${asyncKeyword}(${arrowParams}) => ${arrowBody}`;
        

      case "ObjectExpression":
        const properties = node.properties
          .map((p) => {
            const key = p.key.name;
            const value = transformNode(p.value);
            return `${key}: ${value}`;
          })
          .join(", ");
        return `{${properties}}`;

      case "BinaryExpression":
        return `${transformNode(node.left)} ${node.operator} ${transformNode(
          node.right
        )}`;

      case "MemberExpression": return `${transformNode(node.object)}.${node.property.name}`; 

      case "ArrayExpression":
        const elements = node.elements.map(transformNode).join(", ");
        return `[${elements}]`;

      default:
        console.log("Unhandled node:", node.type);
        return "";
    }
  }

  return transformNode(ast);
}

function transformJSX(code) {
    const acornWithJsx = acorn.Parser.extend(acornJsxPlugin()); 
    const ast = acornWithJsx.parse(code, {
      ecmaVersion: "latest",
      sourceType: "module",
      plugins: { jsx: true },
    }); 
    return transformAST(ast);
}
window.transformJSX = transformJSX;
  

export { transformJSX };