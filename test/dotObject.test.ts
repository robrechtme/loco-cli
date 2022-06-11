import { dotObject } from "../src/lib/dotObject";
import { local } from "./mockdata/mockDiff";

test("dotObject", () => {
  expect(dotObject(local.en)).toStrictEqual({
    title: "Newly added key local in EN only",
    "buttons.confirm": "Confirm",
    "buttons.dismiss": "Dismiss",
    "buttons.skip": "Newly added key deep local in EN only",
  });
});
