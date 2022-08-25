import { expect, test } from "vitest";
import { readFiles } from "../src/lib/readFiles";

test("readFiles without namespaces", async () => {
  expect(
    await readFiles("./test/mockdata/no-namespaces", false)
  ).toMatchSnapshot();
});

test("readFiles with namespaces", async () => {
  expect(await readFiles("./test/mockdata/namespaces", true)).toMatchSnapshot();
});
