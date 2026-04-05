export function placeholders(start: number, count: number): string {
  return Array.from({ length: count }, (_, index) => `$${start + index}`).join(', ');
}

export function assignmentList(columns: string[], start = 1): string {
  return columns.map((column, index) => `${column} = $${start + index}`).join(', ');
}

export function columnList(columns: string[]): string {
  return columns.join(', ');
}

export function buildInsertStatement(table: string, columns: string[]): string {
  return `
    insert into ${table} (${columnList(columns)})
    values (${placeholders(1, columns.length)})
    returning *
  `;
}

export function buildUpdateStatement(table: string, columns: string[], whereColumn: string): string {
  return `
    update ${table}
    set ${assignmentList(columns)}
    where ${whereColumn} = $${columns.length + 1}
    returning *
  `;
}

export function entriesFromInput<TInput extends Record<string, unknown>>(
  input: TInput,
): Array<[keyof TInput, TInput[keyof TInput]]> {
  return Object.entries(input) as Array<[keyof TInput, TInput[keyof TInput]]>;
}
