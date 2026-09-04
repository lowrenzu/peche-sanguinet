import { promises as fs } from "fs";
import path from "path";
import { dataPath, readJson, writeJson } from "./store/jsonStore";
import { getConfig } from "./config";

interface CacheEnvelope<T> {
  fetchedAt: string;
  source: string;
  payload: T;
}

export async function getCached<T>(key: string): Promise<CacheEnvelope<T> | null> {
  return readJson<CacheEnvelope<T>>(`cache/${key}.json`);
}

export async function setCached<T>(
  key: string,
  source: string,
  payload: T,
): Promise<CacheEnvelope<T>> {
  const envelope: CacheEnvelope<T> = {
    fetchedAt: new Date().toISOString(),
    source,
    payload,
  };
  await writeJson(`cache/${key}.json`, envelope);
  return envelope;
}

export function isFresh(fetchedAt: string, ttlMinutes: number): boolean {
  const age = Date.now() - new Date(fetchedAt).getTime();
  return age < ttlMinutes * 60_000;
}

export async function cachedFetch<T>(opts: {
  key: string;
  source: string;
  ttlMinutes?: number;
  loader: () => Promise<T>;
}): Promise<{ data: T; fetchedAt: string; fromCache: boolean; stale: boolean; source: string }> {
  const cfg = await getConfig();
  const ttl = opts.ttlMinutes ?? cfg.cacheTtlMinutes;
  const existing = await getCached<T>(opts.key);

  if (existing && isFresh(existing.fetchedAt, ttl)) {
    return {
      data: existing.payload,
      fetchedAt: existing.fetchedAt,
      fromCache: true,
      stale: false,
      source: existing.source,
    };
  }

  try {
    const payload = await opts.loader();
    try {
      const saved = await setCached(opts.key, opts.source, payload);
      return {
        data: payload,
        fetchedAt: saved.fetchedAt,
        fromCache: false,
        stale: false,
        source: opts.source,
      };
    } catch {
      return {
        data: payload,
        fetchedAt: new Date().toISOString(),
        fromCache: false,
        stale: false,
        source: opts.source,
      };
    }
  } catch (err) {
    if (existing) {
      return {
        data: existing.payload,
        fetchedAt: existing.fetchedAt,
        fromCache: true,
        stale: true,
        source: existing.source,
      };
    }
    throw err;
  }
}

export async function clearWeatherCache(): Promise<number> {
  const dir = dataPath("cache");
  try {
    const files = await fs.readdir(dir);
    await Promise.all(files.map((f) => fs.unlink(path.join(dir, f))));
    return files.length;
  } catch {
    return 0;
  }
}
