export function truncateString(str: string, num = 20) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "…";
}
