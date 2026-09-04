import { promises as fs } from "fs";
import path from "path";

const serverless = Boolean(
  process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME,
);
const DATA_DIR = serverless
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
  try {
    await ensureDir(path.dirname(dataPath(file)));
    const tmp = dataPath(`${file}.tmp`);
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
    await fs.rename(tmp, dataPath(file));
  } catch {
    // Filesystem is ephemeral/read-only on serverless hosts.
  }
}

export async function appendError(entry: {
  at: string;
  source: string;
  message: string;
}): Promise<void> {
  try {
    const prev = (await readJson<typeof entry[]>("errors.json")) ?? [];
    prev.unshift(entry);
    await writeJson("errors.json", prev.slice(0, 80));
  } catch {
    // ignore
  }
}
