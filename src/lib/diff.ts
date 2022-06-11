import { detailedDiff } from "deep-object-diff";
import { Translations } from "../types";
import { dotObject } from "./dotObject";

interface DetailedDiff {
  added: object;
  updated: object;
  deleted: object;
}

export const diff = (local: Translations, remote: Translations) => {
  const { added, updated, deleted } = detailedDiff(
    local,
    remote
  ) as DetailedDiff;

  return {
    added: dotObject(added),
    updated: dotObject(updated),
    deleted: dotObject(deleted),
  };
};
