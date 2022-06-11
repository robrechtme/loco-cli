import { diff } from "../src/lib/diff";
import { local, remote } from "./mockdata/mockDiff";

test("returns diff", () => {
  expect(diff(local, remote)).toMatchSnapshot();
});
