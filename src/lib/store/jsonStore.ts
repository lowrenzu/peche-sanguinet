import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "peche-sanguinet")
  : path.join(process.cwd(), "data");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export function dataPath(...parts: string[]): string {
  return path.join(DATA_DIR, ...parts);
}

export async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(dataPath(file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(dataPath(file)));
  const tmp = dataPath(`${file}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, dataPath(file));
}

export async function appendError(entry: {
  at: string;
  source: string;
  message: string;
}): Promise<void> {
  const prev = (await readJson<typeof entry[]>("errors.json")) ?? [];
  prev.unshift(entry);
  await writeJson("errors.json", prev.slice(0, 80));
}
