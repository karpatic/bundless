// The parser owns syntax. Ordinary JavaScript is copied, never re-emitted.
function walk(node, visit) {
  if (!node || typeof node.type !== 'string') return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}

const nameOf = node => node.name ?? node.value;

// Loader ranges use UTF-16 source offsets: ss/se enclose the syntax, s/e
// enclose the unquoted specifier, and d distinguishes static/dynamic imports.
export function analyzeAST(ast) {
  const imports = [], exports = [];
  const addExport = name => exports.push({ n: name });
  function bindings(node) {
    if (!node) return;
    switch (node.type) {
      case 'Identifier': addExport(node.name); break;
      case 'ObjectPattern': node.properties.forEach(p => bindings(p.value || p.argument)); break;
      case 'ArrayPattern': node.elements.forEach(bindings); break;
      case 'AssignmentPattern': bindings(node.left); break;
      case 'RestElement': bindings(node.argument); break;
    }
  }
  walk(ast, node => {
    if (node.type === 'ImportExpression') {
      imports.push({ ss: node.start, se: node.end, d: 0,
        n: node.source.type === 'Literal' ? node.source.value : undefined,
        a: node.options || node.arguments?.length ? 0 : -1,
        argument: [node.source.start, node.source.end],
        sequence: node.source.type === 'SequenceExpression' });
      return;
    }
    if (node.type === 'ExportDefaultDeclaration') addExport('default');
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration?.type === 'VariableDeclaration') {
        node.declaration.declarations.forEach(d => bindings(d.id));
      } else if (node.declaration) bindings(node.declaration.id);
      node.specifiers.forEach(s => addExport(nameOf(s.exported)));
    }
    if (node.type === 'ExportAllDeclaration' && node.exported) addExport(nameOf(node.exported));
    if (!['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type) || !node.source) return;
    const item = { ss: node.start, se: node.end, s: node.source.start + 1,
      e: node.source.end - 1, n: node.source.value, d: -1,
      a: node.attributes?.length || node.assertions?.length ? 0 : -1 };
    if (node.type === 'ImportDeclaration') {
      item.kind = 'import';
      item.hasBindings = node.specifiers.length > 0;
      item.bindings = { namedImports: [] };
      for (const s of node.specifiers) {
        if (s.type === 'ImportDefaultSpecifier') item.bindings.defaultImport = s.local.name;
        else if (s.type === 'ImportNamespaceSpecifier') item.bindings.namespaceImport = s.local.name;
        else item.bindings.namedImports.push({ imported: nameOf(s.imported), local: s.local.name });
      }
    } else if (node.type === 'ExportAllDeclaration') {
      item.kind = node.exported ? 'namespace' : 'star';
      item.exported = node.exported && nameOf(node.exported);
    } else {
      item.kind = 'named';
      item.bindings = node.specifiers.map(s => ({ imported: nameOf(s.local), local: nameOf(s.exported) }));
    }
    imports.push(item);
  });
  return [imports, exports];
}

export function transformAST(ast, debug = {}) {
  const source = debug.code;
  if (typeof source !== 'string') throw new TypeError('Bundless source-range transformation requires original code.');
  const edits = [...(debug.replacements || [])];
  walk(ast, node => {
    if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
      edits.push({ start: node.start, end: node.end, node });
    }
    if (debug.preact && node.type === 'MemberExpression' && !node.computed && !node.optional) {
      const property = node.property.name;
      if (node.object.name === 'React' && ['createElement', 'Fragment', 'useState', 'useEffect', 'useContext', 'useRef', 'useMemo'].includes(property)) {
        edits.push({ start: node.start, end: node.end, code: property === 'createElement' ? 'h' : property });
      } else if (node.object.name === 'ReactDOM' && property === 'render') {
        edits.push({ start: node.start, end: node.end, code: 'render' });
      }
    }
  });
  edits.sort((a, b) => a.start - b.start || b.end - a.end);
  const output = [];
  let index = 0;
  function emit(text, start, original = false) {
    output.push(text);
    debug.updatePosition?.(text, { start }, original);
  }
  function range(start, end) {
    let cursor = start;
    while (index < edits.length && edits[index].start < end) {
      const edit = edits[index++];
      if (edit.start < cursor || edit.end > end) throw new TypeError('Bundless source edits overlap.');
      emit(source.slice(cursor, edit.start), cursor, true);
      if (edit.node) jsx(edit.node);
      else emit(edit.code, edit.start);
      cursor = edit.end;
    }
    emit(source.slice(cursor, end), cursor, true);
  }
  function name(node) {
    if (node.type === 'JSXMemberExpression') return `${name(node.object)}.${name(node.property)}`;
    if (node.type === 'JSXNamespacedName') return `${name(node.namespace)}:${name(node.name)}`;
    return node.name;
  }
  function expression(node) {
    // Parentheses removed from AST ranges still bound sequences/objects here.
    emit('(', node.start);
    range(node.start, node.end);
    emit(')', node.end);
  }
  function jsx(node) {
    const opening = node.openingElement;
    let tag = opening && name(opening.name);
    if (debug.preact && tag === 'React.Fragment') tag = 'Fragment';
    emit(`(${debug.preact ? "h" : "React.createElement"}(${opening
      ? (opening.name.type === 'JSXIdentifier' && tag[0] === tag[0].toLowerCase() ? JSON.stringify(tag) : tag)
      : debug.preact ? 'Fragment' : 'React.Fragment'}, ${opening ? '{' : 'null'}`, node.start);
    if (opening) {
      opening.attributes.forEach((attr, i) => {
        if (i) emit(', ', attr.start);
        if (attr.type === 'JSXSpreadAttribute') {
          emit('...', attr.start);
          expression(attr.argument);
        } else {
          emit(`${JSON.stringify(name(attr.name))}: `, attr.start);
          if (!attr.value) emit('true', attr.start);
          else if (attr.value.type === 'Literal') emit(JSON.stringify(attr.value.value), attr.value.start);
          else if (attr.value.type === 'JSXExpressionContainer') expression(attr.value.expression);
          else range(attr.value.start, attr.value.end);
        }
      });
      emit('}', opening.end);
    }
    for (const child of node.children) {
      if (child.type === 'JSXText') {
        const text = child.value.split('\n').map(line => line.trim()).join('\n').trim();
        if (text) emit(`, ${JSON.stringify(text)}`, child.start);
      } else if (child.type === 'JSXExpressionContainer') {
        if (child.expression.type !== 'JSXEmptyExpression') {
          emit(', ', child.start);
          expression(child.expression);
        }
      } else {
        if (child.type !== 'JSXElement' && child.type !== 'JSXFragment') throw new TypeError(`Bundless AST transformer does not support ${child.type}.`);
        emit(', ', child.start);
        range(child.start, child.end);
      }
    }
    emit('))', node.end);
  }
  if (debug.prefix) emit(debug.prefix, 0);
  range(0, source.length);
  return { code: output.join(''), map: debug.toEncodedMap?.(debug.map) };
}
