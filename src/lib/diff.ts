import { detailedDiff } from 'deep-object-diff';
import { DiffRecord, PushOptions, Translations, TranslationValue } from '../../types';
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
    deletedCount: Object.keys(deletedRes).length
  };
};
