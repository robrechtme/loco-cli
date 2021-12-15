import { existsSync } from "fs";
import exit from "./exit";
import { readFile } from "fs/promises";

export const importJSON = async (path: string) => {
  if (!existsSync(path)) {
    exit(`File not found: ${path}`);
  }

  return JSON.parse(await readFile(path, "utf8")) as Record<string, string>;
};
