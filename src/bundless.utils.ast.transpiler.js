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
      case "ExportDefaultDeclaration": return `export default ${transformNode(node.declaration)};`;
      case "ImportSpecifier": return node.imported.name;
      case "ImportDefaultSpecifier": return node.local.name;
      case "ImportExpression": return `window.import(${transformNode(node.source)})`;
      case "AssignmentExpression": return `${transformNode(node.left)} ${node.operator} ${transformNode(node.right)}`;
      case "SpreadElement": return `...${transformNode(node.argument)}`;
      case "LogicalExpression": return `${transformNode(node.left)} ${node.operator} ${transformNode(node.right)}`;
      case "ChainExpression": return `${transformNode(node.expression)}`;
      case "TemplateLiteral": 
        return '`' + node.quasis.map((quasi, i) => {
          const value = quasi.value.raw;
          const expr = node.expressions[i] ? "${" + transformNode(node.expressions[i]) + "}" : "";
          return value + expr;
        }).join('') + '`';
      case "ImportDeclaration":
        const specifiers = node.specifiers
          .map((specifier) => transformNode(specifier))
          .filter(Boolean)
          .join(", "); 
        const importSource = node.source ? `'${node.source.value}'` : '';
        if (node.specifiers.some(specifier => specifier.type === 'ImportDefaultSpecifier')) {
          // console.log('DEFAULT FOUND', specifiers);
          // Handle default import
          const defaultSpecifier = node.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier');
          // if not the same length then there are named imports
          if (node.specifiers.length > 1) {
            const namedImports = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier').map(transformNode).join(", ");
            return `import ${defaultSpecifier.local.name}, {${namedImports}} from ${importSource}`;
          }
          else{
            const localName = defaultSpecifier.local.name;
            return `import ${localName} from ${importSource}`;
          }  
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
            const value = attr.value ? transformNode(attr.value) : "true"; // Handle boolean attributes
            // If attribute name contains a hyphen, use string notation
            if (name.includes('-')) {
              return `'${name}': ${value}`;
            }
            // Regular attribute names
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
        // Don't trim multiline text to preserve formatting in pre tags
        let text = node.value;
        
        // Only trim if it doesn't contain meaningful line breaks
        if (!text.includes('\n')) {
          text = text.trim();
        } else {
          // For multiline text, preserve line breaks but trim each line
          text = text.split('\n')
            .map(line => line.trim())
            .join('\n')
            .trim(); // Still trim start/end
        }
        
        // Escape single quotes and handle escaping of newlines for JavaScript strings
        const escapedText = text
          .replace(/'/g, "\\'")
          .replace(/\n/g, "\\n");
          
        return text ? `'${escapedText}'` : "";

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

      case "MemberExpression": 
        if (node.computed) {
          return `${transformNode(node.object)}[${transformNode(node.property)}]`;
        }
        const optionalChaining = node.optional ? '?.' : '.';
        return `${transformNode(node.object)}${optionalChaining}${node.property.name}`; 

      case "ArrayExpression":
        const elements = node.elements.map(transformNode).join(", ");
        return `[${elements}]`;

      default:
        console.log("Unhandled node:", node.type, node);
        return "";
    }
  }  

  let prefix = '';
  let output = transformNode(ast);
  // console.log('ast:', ast);
  // console.log('window.Bundless.to==', window.Bundless.to) 
  if(window.Bundless.to === 'preact'){
    // console.log('Pre Output:', output);

    prefix = `import { h, render } from 'https://esm.sh/preact@10.5.13/es2022/preact.mjs';\n`;
    prefix += `import { useState, useEffect, useRef } from 'https://esm.sh/preact@10.5.13/es2022/hooks.mjs';\n`;
   
    output = output.replace(/React.createElement/g, "h");  
    output = output.replace(/ReactDOM.render/g, "render"); 
    output = output.replace(/React.useState/g, "useState"); 
    output = output.replace(/React.useEffect/g, "useEffect");
    output = output.replace(/React.useRef/g, "useRef");
    
    // Strip React imports as we use Preact instead
    output = output.replace(/import React.*from ['"].*['"];?\n?/g, "");
  } 
  // console.log('Output:', output);
  return `${prefix}${output}`;
 
}

export { transformAST };