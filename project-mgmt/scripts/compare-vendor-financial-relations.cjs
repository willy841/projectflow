const path = require('path');

async function loadModule(modulePath) {
  const fullPath = path.resolve(process.cwd(), modulePath);
  return require(fullPath);
}

function byKey(items) {
  return new Map(items.map((item) => [item.relationKey, item]));
}

async function main() {
  const clientStore = await loadModule('.next/server/chunks/ssr/src_components_project-vendor-financial-store_ts.js');
  const dbAdapter = await loadModule('.next/server/chunks/ssr/src_lib_db_vendor-financial-relation-adapter_ts.js');

  const clientRelations = clientStore.getProjectVendorFinancialRelations();
  const dbRelations = await dbAdapter.listDbVendorFinancialRelations();

  const clientMap = byKey(clientRelations);
  const dbMap = byKey(dbRelations);
  const allKeys = Array.from(new Set([...clientMap.keys(), ...dbMap.keys()])).sort();

  const onlyClient = [];
  const onlyDb = [];
  const diffs = [];

  for (const key of allKeys) {
    const client = clientMap.get(key);
    const db = dbMap.get(key);
    if (client && !db) {
      onlyClient.push(key);
      continue;
    }
    if (!client && db) {
      onlyDb.push(key);
      continue;
    }
    if (!client || !db) continue;

    const diff = {};
    if (client.vendorName !== db.vendorName) diff.vendorName = [client.vendorName, db.vendorName];
    if (client.adjustedCostTotal !== db.adjustedCostTotal) diff.adjustedCostTotal = [client.adjustedCostTotal, db.adjustedCostTotal];
    if (client.rawCostTotal !== db.rawCostTotal) diff.rawCostTotal = [client.rawCostTotal, db.rawCostTotal];
    if (client.paymentStatus !== db.paymentStatus) diff.paymentStatus = [client.paymentStatus, db.paymentStatus];
    if (client.unpaidAmount !== db.unpaidAmount) diff.unpaidAmount = [client.unpaidAmount, db.unpaidAmount];
    if (client.packageCount !== db.packageCount) diff.packageCount = [client.packageCount, db.packageCount];
    if (JSON.stringify(client.packageSummary) !== JSON.stringify(db.packageSummary)) diff.packageSummary = [client.packageSummary, db.packageSummary];
    if (Object.keys(diff).length) diffs.push({ key, diff });
  }

  console.log(JSON.stringify({
    clientCount: clientRelations.length,
    dbCount: dbRelations.length,
    onlyClient,
    onlyDb,
    diffs,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
