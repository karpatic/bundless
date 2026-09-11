import { init as initModuleLexer, parse as parseModuleSyntax } from "es-module-lexer";
import { getModuleReplacements, isTransformableLocalModuleImport } from "./bundless.utils.js";

function splitImportSpecifiers(specifiers) {
  return specifiers
    .split(",")
    .map((specifier) => specifier.trim())
    .filter(Boolean);
}

function normalizeImportName(name) {
  const trimmed = name.trim();
  const quote = trimmed[0];
  if ((quote === "'" || quote === '"') && trimmed[trimmed.length - 1] === quote) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseNamedImportSpecifiers(specifiers) {
  return splitImportSpecifiers(specifiers)
    .map((specifier) => {
      if (/^type\s+/.test(specifier)) {
        return false;
      }

      const alias = specifier.match(/^(.+?)\s+as\s+(.+)$/);
      const imported = normalizeImportName(alias ? alias[1] : specifier);
      const local = normalizeImportName(alias ? alias[2] : specifier);
      return { imported, local };
    })
    .filter(Boolean);
}

function parseImportClause(importClause) {
  const imports = {
    defaultImport: false,
    namespaceImport: false,
    namedImports: [],
    typeOnly: false,
  };

  if (!importClause) {
    return imports;
  }

  const clause = importClause.trim();
  if (/^type\b/.test(clause)) {
    imports.typeOnly = true;
    return imports;
  }

  let remainingClause = clause;
  const namedImportMatch = remainingClause.match(/\{([\s\S]*)\}/);
  if (namedImportMatch) {
    imports.namedImports = parseNamedImportSpecifiers(namedImportMatch[1]);
    remainingClause = remainingClause.replace(namedImportMatch[0], "");
  }

  const namespaceImportMatch = remainingClause.match(/\*\s+as\s+([^,\s]+)/);
  if (namespaceImportMatch) {
    imports.namespaceImport = namespaceImportMatch[1];
    remainingClause = remainingClause.replace(namespaceImportMatch[0], "");
  }

  const defaultImport = remainingClause.replace(/,/g, " ").trim();
  if (defaultImport) {
    imports.defaultImport = defaultImport.split(/\s+/)[0];
  }

  return imports;
}

function applyModuleReplacements(code, replacements) {
  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (result, replacement) =>
        result.slice(0, replacement.start) + replacement.code + result.slice(replacement.end),
      code
    );
}

function getStaticImportClause(code, moduleImport) {
  const prefix = code.slice(moduleImport.ss + "import".length, moduleImport.s - 1).trim();
  if (!prefix) {
    return "";
  }
  const fromMatch = prefix.match(/^([\s\S]*?)\s+from\s*$/);
  if (!fromMatch) {
    throw new SyntaxError(`Bundless could not parse static import: ${code.slice(moduleImport.ss, moduleImport.se)}`);
  }
  return fromMatch[1].trim();
}


// Keep legacy clause parsing on local source imports only; native syntax passes through.
export async function analyzeModuleSyntax(code, filename) {
  await initModuleLexer;
  const [imports, exports] = parseModuleSyntax(code, filename);
  for (const item of imports) {
    if (item.d >= 0) {
      item.argument = [item.d + 1, item.se - 1];
    } else if (item.d === -1) {
      const statement = code.slice(item.ss, item.se);
      if (/^\s*export\s*\*(?!\s*as\b)\s*/.test(statement)) {
        item.kind = "star";
      } else if (/^\s*export\s*\*\s*as\b/.test(statement)) {
        item.kind = "namespace";
        if (!isTransformableLocalModuleImport(item.n)) continue;
        const match = statement.match(/^\s*export\s*\*\s*as\s*([^\s]+)\s*from\b/);
        if (!match) throw new SyntaxError(`Bundless could not parse namespace re-export: ${statement}`);
        item.exported = normalizeImportName(match[1]);
      } else if (/^\s*export\b/.test(statement)) {
        item.kind = "named";
        if (!isTransformableLocalModuleImport(item.n)) continue;
        const match = statement.match(/^\s*export\s*\{([\s\S]*?)\}\s*from\b/);
        if (!match) throw new SyntaxError(`Bundless could not parse named re-export: ${statement}`);
        item.bindings = parseNamedImportSpecifiers(match[1]);
      } else {
        item.kind = "import";
        if (!isTransformableLocalModuleImport(item.n)) continue;
        const clause = getStaticImportClause(code, item);
        item.bindings = parseImportClause(clause);
        item.hasBindings = !!clause;
      }
    }
  }
  return [imports, exports];
}

export async function handleImports(code, pathTo, filename) {
  if (!code.includes("import") && !code.includes("export")) return code;
  const analysis = await analyzeModuleSyntax(code, pathTo + filename);
  return applyModuleReplacements(code, await getModuleReplacements(code, pathTo, filename, analysis));
}
