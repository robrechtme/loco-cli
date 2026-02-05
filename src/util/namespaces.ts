import { TranslationValue } from '../../types';

export const splitIntoNamespaces = (
  json: TranslationValue,
  { defaultNs = 'default', separator = ':' } = {}
): Record<string, TranslationValue> =>
  Object.entries(json).reduce<Record<string, TranslationValue>>((acc, [key, value]) => {
    // Pull out the group name from the key
    const chunks = key.split(new RegExp(`${separator}(.*)`, 's'));
    const hasNamespace = chunks.length > 1;
    const namespace = (hasNamespace ? chunks[0] : defaultNs) ?? defaultNs;
    const assetKey = (hasNamespace ? chunks[1] : chunks[0]) ?? key;

    // Check if the group exists, if not, create it
    const group = acc[namespace] ?? (acc[namespace] = {});
    // Add the current entry to the result
    group[assetKey] = value;
    return acc;
  }, {});
