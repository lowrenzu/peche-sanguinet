const fs = require("fs");
const path = require("path");
const skipDirs = new Set(["node_modules", ".next", "tmp-deploy", "scripts", "tests"]);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(e.name) || (e.name.startsWith(".") && e.name !== ".gitignore")) continue;
    if (dir === "." && e.name === "data") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = [];
for (const f of walk(".")) {
  const rel = f.split(path.sep).join("/");
  if (rel === "prompt.txt" || rel === "package-lock.json") continue;
  files.push({ file: rel, data: fs.readFileSync(f, "utf8") });
}
const gi = fs.readFileSync(".gitignore", "utf8");
if (!files.some((x) => x.file === ".gitignore")) files.push({ file: ".gitignore", data: gi });
fs.writeFileSync("tmp-deploy/vercel-files.json", JSON.stringify(files));
console.log(files.length, "files", files.reduce((s, f) => s + f.data.length, 0));
console.log(files.map((f) => f.file).join("\n"));
