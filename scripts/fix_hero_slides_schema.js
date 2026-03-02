// scripts/fix_hero_slides_schema.js
// Usage:
// 1) Install deps (if needed): npm install dotenv
// 2) Set environment variable APPWRITE_API_KEY with an API key from your Appwrite console (Project API key with permissions to manage database schema).
// 3) Ensure .env.local contains NEXT_PUBLIC_APPWRITE_PROJECT_ID and NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_DATABASE_ID
// 4) Run: node scripts/fix_hero_slides_schema.js

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const fetch = global.fetch || require('node-fetch');

const API_KEY = process.env.APPWRITE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT; // expected like https://fra.cloud.appwrite.io/v1
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

if (!API_KEY) {
  console.error("Missing APPWRITE_API_KEY. Create an API key in Appwrite console and set APPWRITE_API_KEY env var.");
  process.exit(1);
}
if (!PROJECT_ID || !ENDPOINT || !DATABASE_ID) {
  console.error("Missing Appwrite config in .env.local (NEXT_PUBLIC_APPWRITE_PROJECT_ID, NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_DATABASE_ID). Please set them.");
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(method, path, body) {
  const url = `${ENDPOINT}${path}`; // ENDPOINT likely contains /v1
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch(e) { json = text; }
  return { status: res.status, ok: res.ok, body: json };
}

async function run() {
  console.log('Running Appwrite schema fixer for collection: hero_slides');

  const coll = 'hero_slides';

  // 1) Delete integer column 'id' if exists
  try {
    console.log('Deleting attribute "id" if exists...');
    const del = await api('delete', `/databases/${DATABASE_ID}/collections/${coll}/attributes/id`);
    if (del.ok) console.log('Deleted attribute id.');
    else console.log('Delete id response:', del.status, del.body);
  } catch (e) { console.error('Error deleting id attribute:', e); }

  // 2) Change product_id to string: delete if exists then create string attribute
  try {
    console.log('Ensuring product_id is type string...');
    const delPid = await api('delete', `/databases/${DATABASE_ID}/collections/${coll}/attributes/product_id`);
    if (delPid.ok) console.log('Deleted existing product_id attribute (non-string).');
    else console.log('Delete product_id response:', delPid.status);

    // create string attribute
    const createPid = await api('post', `/databases/${DATABASE_ID}/collections/${coll}/attributes/string`, {
      key: 'product_id',
      size: 255,
      required: false,
      signed: false
    });
    if (createPid.ok) console.log('Created product_id as string attribute.');
    else console.log('Create product_id response:', createPid.status, createPid.body);
  } catch (e) { console.error('Error handling product_id attribute:', e); }

  // 3) Ensure image1_url and image2_url exist as string (url/text)
  for (const key of ['image1_url', 'image2_url']) {
    try {
      console.log(`Ensuring attribute ${key} exists (string)...`);
      // try create; if exists, server will return error
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

  console.log('Done. Please check Appwrite console and then test admin/slider upload again.');
}

run().catch(err => { console.error(err); process.exit(1); });
