const fs = require("fs");
const path = require("path");

const skip = new Set(["node_modules", ".next", "data", "tmp-deploy", "scripts"]);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(e.name) || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = walk(".").filter((f) => {
  const n = f.split(path.sep).join("/");
  if (n === "prompt.txt" || n === "package-lock.json") return false;
  if (n.endsWith(".log")) return false;
  return true;
});

const batches = [];
let cur = [];
let size = 0;
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  const rel = f.split(path.sep).join("/");
  if (cur.length >= 12) {
    batches.push(cur);
    cur = [];
    size = 0;
  }
  cur.push({ path: rel, content });
  size += content.length;
}
if (cur.length) batches.push(cur);

fs.mkdirSync("tmp-deploy", { recursive: true });
batches.forEach((b, i) => {
  fs.writeFileSync(path.join("tmp-deploy", `batch${i}.json`), JSON.stringify(b));
});
console.log(
  "batches",
  batches.length,
  batches.map((b) => `${b.length} files ${b.reduce((s, x) => s + x.content.length, 0)}`),
);
