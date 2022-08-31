import { expect, test } from "vitest";
import { diff } from "../src/lib/diff";
import { local, remote } from "./mockdata/mockDiff";

test("returns diff", () => {
  expect(diff(local, remote)).toMatchSnapshot();
});

test("returns diff without new assets", () => {
  expect(diff(local, remote, { "ignore-new": true })).toMatchSnapshot();
});

test("returns diff without updated assets", () => {
  expect(diff(local, remote, { "ignore-existing": true })).toMatchSnapshot();
});
