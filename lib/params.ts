export function readParam(
  value: string | string[] | undefined
): string {
  return typeof value === 'string' ? value : '';
}
