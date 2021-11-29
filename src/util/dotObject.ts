/**
 * Transform nested JS object to key-value pairs using dot notation.
 */
export const dotObject = (obj: object): Record<string, string> => {
  const res: Record<string, string> = {};

  function recurse(obj: object, keyPrefix?: string) {
    for (const key in obj) {
      const value = obj[key as keyof typeof obj];
      const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
      if (value && typeof value === "object") {
        // it's a nested object, so do it again
        recurse(value, newKey);
      } else {
        // it's not an object, so set the property
        res[newKey] = value;
      }
    }
  }
  recurse(obj);
  return res;
};
