// Extract debug properties correctly
// debug { sourceFilename, toEncodedMap }
function transformAST(ast, debug = {}) { 
  let indent = 0;
  const spacing = "  ";  
  
  

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
      case "Literal": result = node.raw; break;
      case "Identifier": result = node.name; break;
      case "UnaryExpression": result = `${node.operator} ${transformNode(node.argument)}`; break;
      case "Program": 
        result = node.body.map(transformNode).join("\n\n"); 
        break;
      case "ExpressionStatement": result = `${getIndent()}${transformNode(node.expression)};`; break;
      case "ReturnStatement": result = `return ${transformNode(node.argument)};`; break;
      case "ExportDefaultDeclaration": result = `export default ${transformNode(node.declaration)};`; break;
      case "ImportSpecifier": result = node.imported.name; break;
      case "ImportDefaultSpecifier": result = node.local.name; break;
      case "ImportExpression": result = `window.import(${transformNode(node.source)})`; break;
      case "AssignmentExpression": {
        result = `${transformNode(node.left)} ${node.operator} ${transformNode(node.right)}`;
        break;
      }
      case "SpreadElement": result = `...${transformNode(node.argument)}`; break;
      case "LogicalExpression": result = `${transformNode(node.left)} ${node.operator} ${transformNode(node.right)}`; break;
      case "ChainExpression": result = `${transformNode(node.expression)}`; break;
      case "JSXFragment": result = node.children.map(transformNode).join("\n"); break;
      case "JSXExpressionContainer": result = transformNode(node.expression); break;
      case "JSXEmptyExpression": result = ""; break;
      case "NewExpression": result = `new ${transformNode(node.callee)}(${node.arguments.map(transformNode).join(", ")})`; break;
      case "TemplateLiteral": 
        result = '`' + node.quasis.map((quasi, i) => {
          const value = quasi.value.raw;
          const expr = node.expressions[i] ? "${" + transformNode(node.expressions[i]) + "}" : "";
          return value + expr;
        }).join('') + '`';
        break;
      case "ImportDeclaration":
        const specifiers = node.specifiers
          .map((specifier) => transformNode(specifier))
          .filter(Boolean)
          .join(", "); 
        const importSource = node.source ? `'${node.source.value}'` : '';
        if (node.specifiers.some(specifier => specifier.type === 'ImportDefaultSpecifier')) {
          const defaultSpecifier = node.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier');
          if (node.specifiers.length > 1) {
            const namedImports = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier').map(transformNode).join(", ");
            result = `import ${defaultSpecifier.local.name}, {${namedImports}} from ${importSource}`;
          }
          else{
            const localName = defaultSpecifier.local.name;
            result = `import ${localName} from ${importSource}`;
          }  
        } else if (specifiers) {
          result = `import {${specifiers}} from ${importSource}`;
        } else {
          result = `import ${importSource}`;
        } 
        break;
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
        result = `function ${node.id.name}(${params}) ${body}`;
        break;
      case "AwaitExpression": result = `await ${transformNode(node.argument)}`; break;
      case "BlockStatement":
        indent++;
        const statements = node.body
          .map((stmt) => `${getIndent()}${transformNode(stmt)}`)
          .join("\n");
        indent--;
        result = `{\n${statements}\n${getIndent()}}`;
        break;
      case "IfStatement":
        const test = transformNode(node.test);
        const consequent = transformNode(node.consequent);
        const alternate = node.alternate
          ? `else ${transformNode(node.alternate)}`
          : "";
        result = `if (${test}) ${consequent} ${alternate}`;
        break;
      case "ConditionalExpression":
        const testExpr = transformNode(node.test);
        const consequentExpr = transformNode(node.consequent);
        const alternateExpr = transformNode(node.alternate);
        result = `${testExpr} ? ${consequentExpr} : ${alternateExpr}`;
        break;
      case "ExportNamedDeclaration": 
        result = `export ${transformNode(node.declaration)}`;
        break;
      case "JSXElement": {
        indent++;
        const name = node.openingElement.name.name;
        const tagName =
          name[0] === name[0].toUpperCase()
            ? name
            : `'${name}'`;
        const props = node.openingElement.attributes
          .map((attr) => {
            if (attr.type === 'JSXSpreadAttribute') {
              return `...${transformNode(attr.argument)}`;
            }
            const name = attr.name.name;
            const value = attr.value ? transformNode(attr.value) : "true";
            if (name.includes('-')) {
              return `'${name}': ${value}`;
            }
            return `${name}: ${value}`;
          })
          .join(", ");
        const children = node.children
          .map((child) => transformNode(child))
          .filter(Boolean);
        indent--;
        if (children.length === 0) {
          result = `React.createElement(${tagName}, {${props}})`;
        } else {
          result = `React.createElement(${tagName}, {${props}},\n${children
            .map((child) => `${getIndent()}${spacing}${child}`)
            .join(",\n")})`;
        }
        break;
      }
      case "JSXText":
        let text = node.value;
        if (!text.includes('\n')) {
          text = text.trim();
        } else {
          text = text.split('\n')
            .map(line => line.trim())
            .join('\n')
            .trim();
        }
        const escapedText = text
          .replace(/'/g, "\\'")
          .replace(/\n/g, "\\n");
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
          result = `${node.id.name};`;
        } else {
          const init = transformNode(node.init);
          if (node.id.type === "ArrayPattern") {
            const elements = node.id.elements
              .map((el) => el ? el.name : "undefined")
              .join(", ");
            result = `[${elements}] = ${init}`;
          } else {
            result = `${node.id.name} = ${init}`;
          }
        }
        break;
      case "CallExpression":
        if (node.callee.type === "MemberExpression") {
          const object = transformNode(node.callee.object);
          const property = node.callee.property.name;
          const args = node.arguments.map(transformNode).join(", ");
          result = `${object}.${property}(${args})`;
        }
        const args = node.arguments.map(transformNode).join(", ");
        result = `${transformNode(node.callee)}(${args})`;
        break;
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
        result = `${asyncKeyword}(${arrowParams}) => ${arrowBody}`;
        break;
      case "ObjectExpression": 
        const properties = node.properties
          .map((p) => {
            if (p.type === "SpreadElement") {
              return `...${transformNode(p.argument)}`;
            } else {
              const key = p.key.name || p.key.value;
              const value = transformNode(p.value);
              return `${key}: ${value}`;
            }
          })
          .join(", ");
        result = `{${properties}}`;
        break;
      case "BinaryExpression":
        result = `${transformNode(node.left)} ${node.operator} ${transformNode(
          node.right
        )}`;
        break;
      case "MemberExpression": 
        if (node.computed) {
          result = `${transformNode(node.object)}[${transformNode(node.property)}]`;
        } else {
          const optionalChaining = node.optional ? '?.' : '.';
          result = `${transformNode(node.object)}${optionalChaining}${node.property.name}`; 
        }
        break;
      case "ArrayExpression":
        const elements = node.elements.map(transformNode).join(", ");
        result = `[${elements}]`;
        break;
      default:
        console.log("Unhandled node:", node.type, node);
        result = "";
    }
    
    debug?.updatePosition?.(result, node);
    return result;
  } 

  let output = transformNode(ast); 
  const sourceMap = debug?.toEncodedMap?.(debug.map); 
  return {
    code: output,
    map: sourceMap
  };
}

export { transformAST };