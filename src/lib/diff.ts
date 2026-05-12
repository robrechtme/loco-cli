import { detailedDiff } from 'deep-object-diff';
import type { DiffRecord, PushOptions, Translations, TranslationValue } from '../../types';
import { dotObject } from './dotObject';

interface DetailedDiff {
  added: TranslationValue;
  updated: TranslationValue;
  deleted: TranslationValue;
}

export interface DiffResult {
  totalCount: number;
  added: DiffRecord;
  addedCount: number;
  updated: DiffRecord;
  updatedCount: number;
  deleted: DiffRecord;
  deletedCount: number;
}

export const diff = (
  local: Translations,
  remote: Translations,
  options?: PushOptions
): DiffResult => {
  // detailedDiff returns {added, updated, deleted} matching our DetailedDiff shape
  const { added, updated, deleted } = detailedDiff(local, remote) as DetailedDiff;
  const ignoreAdded = options?.['ignore-new'];
  const ignoreUpdated = options?.['ignore-existing'];
  const experimentalPushAll = options?.experimentalPushAll;
  const deleteAbsent = options?.['delete-absent'];

  const addedRes = ignoreAdded ? {} : dotObject(added);
  const updatedRes = ignoreUpdated ? {} : dotObject(updated);
  let deletedRes = dotObject(deleted);

  // With `experimentalPushAll` + `delete-absent`, `apiPushAll` uses
  // /import/json?format=multi where `delete-absent` operates on the UNION
  // of locales: an asset is only deleted when it's absent from every locale
  // in the payload. Recompute the deleted set leaf-by-leaf so the diff
  // matches what the upload will actually do — detailedDiff collapses
  // missing branches to a single undefined at the branch level, which loses
  // the resolution needed to apply union semantics correctly.
  // Note: `remote` here is the filesystem-local data, `local` is the
  // api-remote data — see the call site in src/commands/push.ts which
  // invokes diff(remoteFromApi, localFromFs).
  if (experimentalPushAll && deleteAbsent) {
    const localFlat: Record<string, DiffRecord> = {};
    const unionKeys = new Set<string>();
    for (const [loc, t] of Object.entries(remote)) {
      const flat = dotObject(t);
      localFlat[loc] = flat;
      for (const k of Object.keys(flat)) unionKeys.add(k);
    }
    deletedRes = {};
    for (const [loc, t] of Object.entries(local)) {
      const apiFlat = dotObject(t);
      const fsFlat = localFlat[loc] ?? {};
      for (const key of Object.keys(apiFlat)) {
        if (!(key in fsFlat) && !unionKeys.has(key)) {
          deletedRes[`${loc}.${key}`] = undefined;
        }
      }
    }
  }

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
    deletedCount: Object.keys(deletedRes).length
  };
};
