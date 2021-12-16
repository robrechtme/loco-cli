import { existsSync, readdirSync } from "fs";
import exit from "./exit";
import { readFile } from "fs/promises";
import { join } from "path";

export const importJSON = async (path: string) => {
  if (!existsSync(path)) {
    exit(`File not found: ${path}`);
  }

  return JSON.parse(await readFile(path, "utf8")) as Record<string, string>;
};

export const importDir = async (path: string) => {
  const res = {};
  if (!existsSync(path)) {
    exit(`Directory not found: "${path}"`);
  }
  const files = readdirSync(path);

  await Promise.all(
    files.map(async (file) => {
      if (file.endsWith(".json")) {
        const json = await importJSON(join(path, file));
        Object.keys(json).forEach((key) => {
          // @ts-expect-error
          res[`${file.replace(".json", "")}:${key}`] = json[key];
        });
      }
    })
  );
  return res;
};
