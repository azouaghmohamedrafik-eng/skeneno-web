// scripts/create_test_slide.js
// Uploads two small PNGs to the configured Appwrite bucket and creates a hero_slides document
// Usage:
// 1) Ensure APPWRITE_API_KEY is set in environment (or in .env.local)
// 2) node scripts/create_test_slide.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const fetch = global.fetch || require('node-fetch');
const FormData = require('form-data');

const API_KEY = process.env.APPWRITE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT; // e.g. https://fra.cloud.appwrite.io/v1
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
const COLLECTION = 'hero_slides';

if (!API_KEY) { console.error('Missing APPWRITE_API_KEY'); process.exit(1); }
if (!PROJECT_ID || !ENDPOINT || !DATABASE_ID || !BUCKET_ID) { console.error('Missing APPWRITE config in .env.local'); process.exit(1); }

async function uploadFile(filename, buffer) {
  const form = new FormData();
  form.append('file', buffer, { filename });

  const res = await fetch(`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files`, {
    method: 'post',
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
      // NOTE: form-data sets Content-Type including boundary
    },
    body: form
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch(e) { json = text; }
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${JSON.stringify(json)}`);
  return json; // returns file object including $id
}

async function createDocument(data) {
  const body = { documentId: 'unique()', data };
  const res = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION}/documents`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch(e) { json = text; }
  if (!res.ok) throw new Error(`Create document failed: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

function onePixelPng() {
  // 1x1 PNG base64
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
  return Buffer.from(b64, 'base64');
}

async function main() {
  console.log('Uploading two test images to bucket', BUCKET_ID);
  try {
    const buf1 = onePixelPng();
    const buf2 = onePixelPng();

    const f1 = await uploadFile('test-image-1.png', buf1);
    console.log('Uploaded file1 id:', f1.$id || f1.$uid || f1.$id);
    const f2 = await uploadFile('test-image-2.png', buf2);
    console.log('Uploaded file2 id:', f2.$id || f2.$uid || f2.$id);

    const url1 = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${f1.$id}/view?project=${PROJECT_ID}`;
    const url2 = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${f2.$id}/view?project=${PROJECT_ID}`;

    console.log('Creating hero_slides document...');
    const doc = await createDocument({ image1_url: url1, image2_url: url2, product_id: '' });
    console.log('Created hero_slides doc id:', doc.$id || doc.$uid || doc.$id);
    console.log('Done. Check homepage to see the slide.');
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
}

main();
