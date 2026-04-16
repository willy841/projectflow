const { Client } = require('pg');
const crypto = require('node:crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

async function main() {
  const email = process.argv[2];
  const name = process.argv[3] || 'System Owner';
  const password = process.argv[4];

  if (!email || !password) {
    console.error('Usage: node scripts/init-system-owner.js <email> [name] <password>');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);

  await client.query(
    `insert into system_users (email, normalized_email, name, role, is_owner, password_hash, must_change_password, is_active)
     values ($1, $2, $3, 'admin', true, $4, false, true)
     on conflict (normalized_email)
     do update set name = excluded.name, role = 'admin', is_owner = true, is_active = true`,
    [email.trim(), normalizedEmail, name, passwordHash],
  );

  await client.end();
  console.log(`System owner ensured: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
