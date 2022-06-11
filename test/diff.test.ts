import { diff } from "../src/lib/diff";
import { local, remote } from "./mock";

test("returns diff", () => {
  expect(diff(local, remote)).toMatchSnapshot();
});
