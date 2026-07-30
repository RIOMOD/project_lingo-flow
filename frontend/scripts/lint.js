import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");
const scanRoots = ["src", "scripts"].map((path) => join(rootDir, path));
const sourceExtensions = new Set([".js", ".jsx"]);
const importPattern = /\bimport\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
const candidates = ["", ".js", ".jsx", ".json"];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(path);
    }
    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

function resolveRelativeImport(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  for (const suffix of candidates) {
    const candidate = `${base}${suffix}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }
  for (const suffix of candidates.slice(1)) {
    const candidate = join(base, `index${suffix}`);
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

const problems = [];

for (const root of scanRoots) {
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] || match[2];
      if (!specifier?.startsWith(".")) continue;
      if (!resolveRelativeImport(file, specifier)) {
        problems.push(`${file}: missing relative import "${specifier}"`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log("[frontend:lint] Relative imports resolved.");
