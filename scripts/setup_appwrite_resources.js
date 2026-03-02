// scripts/setup_appwrite_resources.js
// Usage:
// 1) Install deps: npm install dotenv node-fetch
// 2) Create API key in Appwrite Console (Project -> API Keys) with permissions for Database and Storage management
// 3) Set environment vars (PowerShell example):
//    $env:APPWRITE_API_KEY="YOUR_KEY"
//    (or create a .env.local with NEXT_PUBLIC_APPWRITE_PROJECT_ID, NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_DATABASE_ID and set APPWRITE_API_KEY too)
// 4) Run: node scripts/setup_appwrite_resources.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const fetch = global.fetch || require('node-fetch');

const API_KEY = process.env.APPWRITE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT; // should include /v1
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'product-images';

if (!API_KEY) {
  console.error('Missing APPWRITE_API_KEY environment variable. Create an API Key in Appwrite and set APPWRITE_API_KEY.');
  process.exit(1);
}
if (!PROJECT_ID || !ENDPOINT || !DATABASE_ID) {
  console.error('Missing Appwrite config in .env.local (NEXT_PUBLIC_APPWRITE_PROJECT_ID, NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_DATABASE_ID).');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(method, path, body) {
  const url = `${ENDPOINT}${path}`; // ENDPOINT expected to include /v1
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  console.log(`${method} ${url}`);
  const res = await fetch(url, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  return { status: res.status, ok: res.ok, body: json };
}

async function ensureBucket() {
  console.log('Checking existing buckets...');
  const list = await api('get', '/storage/buckets');
  if (!list.ok) {
    console.warn('Could not list buckets:', list.status, list.body);
  } else {
    const buckets = Array.isArray(list.body?.buckets) ? list.body.buckets : (list.body?.buckets || []);
    const exists = buckets.find(b => b.$id === BUCKET_ID || b.bucketId === BUCKET_ID || b.id === BUCKET_ID);
    if (exists) {
      console.log('Bucket already exists:', BUCKET_ID);
      return;
    }
  }

  console.log('Creating bucket:', BUCKET_ID);
  // Attempt to create with open read for testing. Adjust permissions for production.
  const body = {
    bucketId: BUCKET_ID,
    name: 'Product Images',
    read: ['role:all'],
    write: ['role:owners']
  };
  const create = await api('post', '/storage/buckets', body);
  if (create.ok) console.log('Bucket created.');
  else console.error('Failed creating bucket:', create.status, create.body);
}

async function fixHeroSlidesSchema() {
  const coll = 'hero_slides';
  console.log('Fixing hero_slides schema...');

  // 1) Delete integer attribute 'id' if exists
  try {
    const del = await api('delete', `/databases/${DATABASE_ID}/collections/${coll}/attributes/id`);
    if (del.ok) console.log('Deleted attribute id.');
    else console.log('Delete id response:', del.status, del.body);
  } catch (e) { console.error('Error deleting id attribute:', e); }

  // 2) Delete and create product_id as string
  try {
    const delPid = await api('delete', `/databases/${DATABASE_ID}/collections/${coll}/attributes/product_id`);
    if (delPid.ok) console.log('Deleted existing product_id attribute (if existed).');
    else console.log('Delete product_id response:', delPid.status);

    const createPid = await api('post', `/databases/${DATABASE_ID}/collections/${coll}/attributes/string`, {
      key: 'product_id',
      size: 255,
      required: false,
      signed: false
    });
    if (createPid.ok) console.log('Created product_id as string attribute.');
    else console.log('Create product_id response:', createPid.status, createPid.body);
  } catch (e) { console.error('Error handling product_id attribute:', e); }

  // 3) Ensure image1_url and image2_url exist as string
  for (const key of ['image1_url', 'image2_url']) {
    try {
      const create = await api('post', `/databases/${DATABASE_ID}/collections/${coll}/attributes/string`, {
        key,
        size: 1024,
        required: false,
        signed: false
      });
      if (create.ok) console.log(`Created attribute ${key}.`);
      else console.log(`Create ${key} response:`, create.status, create.body);
    } catch (e) { console.error(`Error creating ${key}:`, e); }
  }
}

async function main() {
  console.log('Setup Appwrite resources script starting...');
  await ensureBucket();
  await fixHeroSlidesSchema();
  console.log('Done. Check Appwrite console and then test admin/slider upload.');
}

main().catch(err => { console.error(err); process.exit(1); });
