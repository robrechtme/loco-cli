export const splitIntoNamespaces = (
  json: object,
  { defaultNs = "default", separator = ":" } = {}
) =>
  Object.entries(json).reduce<Record<string, object>>((acc, [key, value]) => {
    // Pull out the group name from the key
    const chunks = key.split(separator);
    const namespace = chunks.length > 1 ? chunks[0] : defaultNs;
    const assetKey = chunks.length > 1 ? chunks[1] : chunks[0];

    // Check if the group exists, if not, create it
    if (!acc[namespace]) {
      acc[namespace] = {};
    }
    // Add the current entry to the result
    // @ts-expect-error
    acc[namespace][assetKey] = value;
    return acc;
  }, {});
