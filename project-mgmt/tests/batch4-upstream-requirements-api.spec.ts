import { test, expect } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

function readEnvLocalDatabaseUrl() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf8');
  const line = content.split('\n').find((entry) => entry.startsWith('DATABASE_URL='));
  if (!line) return null;
  return line.slice('DATABASE_URL='.length).trim().replace(/^['\"]|['\"]$/g, '');
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? readEnvLocalDatabaseUrl();
  if (!databaseUrl) throw new Error('Missing DATABASE_URL for batch4 upstream requirements test');
  return databaseUrl;
}

async function queryRows<T>(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

test('batch4 upstream requirements API writes DB truth', async ({ request }) => {
  const title = `batch4-req-${Date.now()}`;

  const createResponse = await request.post(`/api/projects/${PROJECT_ID}/requirements`, {
    data: { title },
  });
  expect(createResponse.ok()).toBeTruthy();
  const createJson = await createResponse.json();
  expect(createJson.ok).toBeTruthy();
  expect(createJson.item?.id).toBeTruthy();

  const createdId = createJson.item.id as string;
  const rowsAfterCreate = await queryRows<{ id: string; title: string }>(
    'select id, title from project_requirements where id = $1',
    [createdId],
  );
  expect(rowsAfterCreate[0]?.title).toBe(title);

  const updatedTitle = `${title}-edited`;
  const updateResponse = await request.patch(`/api/project-requirements/${createdId}`, {
    data: { title: updatedTitle },
  });
  expect(updateResponse.ok()).toBeTruthy();

  const rowsAfterUpdate = await queryRows<{ title: string }>(
    'select title from project_requirements where id = $1',
    [createdId],
  );
  expect(rowsAfterUpdate[0]?.title).toBe(updatedTitle);

  const deleteResponse = await request.delete(`/api/project-requirements/${createdId}`);
  expect(deleteResponse.ok()).toBeTruthy();

  const rowsAfterDelete = await queryRows<{ id: string }>(
    'select id from project_requirements where id = $1',
    [createdId],
  );
  expect(rowsAfterDelete.length).toBe(0);
});
