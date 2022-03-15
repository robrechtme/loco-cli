import { existsSync, readdirSync } from "fs";
import exit from "./exit";
import { readFile } from "fs";
import { join } from "path";

export const importJSON = async (path: string) => {
  if (!existsSync(path)) {
    exit(`File not found: ${path}`);
  }

  return new Promise((resolve, reject) => {
    readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  }) as Promise<Record<string, string>>;
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
