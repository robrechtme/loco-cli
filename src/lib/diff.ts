import { detailedDiff } from "deep-object-diff";
import { PushOptions, Translations } from "../../types";
import { dotObject } from "./dotObject";

interface DetailedDiff {
  added: object;
  updated: object;
  deleted: object;
}

export const diff = (
  local: Translations,
  remote: Translations,
  options?: PushOptions
) => {
  const { added, updated, deleted } = detailedDiff(
    local,
    remote
  ) as DetailedDiff;
  const ignoreAdded = options?.["ignore-new"];
  const ignoreUpdated = options?.["ignore-existing"];

  const addedRes = ignoreAdded ? {} : dotObject(added);
  const updatedRes = ignoreUpdated ? {} : dotObject(updated);
  const deletedRes = dotObject(deleted);
  return {
    totalCount:
      Object.keys(addedRes).length +
      Object.keys(updatedRes).length +
      Object.keys(deletedRes).length,
    added: addedRes,
    addedCount: Object.keys(addedRes).length,
    updated: updatedRes,
    updatedCount: Object.keys(updatedRes).length,
    deleted: deletedRes,
    deletedCount: Object.keys(deletedRes).length,
  };
};
