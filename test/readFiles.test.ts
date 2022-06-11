import { readFiles } from "../src/lib/readFiles";

test("readFiles without namespaces", async () => {
  expect(await readFiles("example/no-namespaces", false)).toMatchSnapshot();
});

test("readFiles with namespaces", async () => {
  expect(await readFiles("example/namespaces", true)).toMatchSnapshot();
});
