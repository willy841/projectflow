export function placeholders(start: number, count: number): string {
  return Array.from({ length: count }, (_, index) => `$${start + index}`).join(', ');
}

export function assignmentList(columns: string[], start = 1): string {
  return columns.map((column, index) => `${column} = $${start + index}`).join(', ');
}

export function columnList(columns: string[]): string {
  return columns.join(', ');
}
