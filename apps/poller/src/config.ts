import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const absolutePath = z
  .string()
  .trim()
  .refine((p) => path.isAbsolute(p), "must be an absolute path");

/** No defaults: a run without its folders stops instead of writing somewhere unintended. */
const ConfigSchema = z.object({
  RECORDINGS_ROOT: absolutePath,
  STATE_DIR: absolutePath,
});

export type Config = z.infer<typeof ConfigSchema>;

export function parseConfig(env: NodeJS.ProcessEnv): Config {
  return ConfigSchema.parse(env);
}

/** `--run-for=<seconds>` gives a run its own end (the smoke and the build's live runs); the task's run has none. */
export function parseRunFor(args: readonly string[]): number | null {
  const arg = args.find((a) => a.startsWith("--run-for="));
  if (arg === undefined) return null;
  const seconds = Number(arg.slice("--run-for=".length));
  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new Error(`${arg}: a whole number of seconds is needed`);
  }
  return seconds;
}

/** A developer's `.env` in the working directory; the run copy gets its values from run-poller.cmd. */
export function loadConfig(): Config {
  if (existsSync(".env")) process.loadEnvFile(".env");
  return parseConfig(process.env);
}
