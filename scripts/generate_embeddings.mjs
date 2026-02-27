import admin from 'firebase-admin';
import OpenAI from 'openai';

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function exponentialBackoff(attempt) {
  const base = 500; // ms
  const jitter = Math.floor(Math.random() * 200);
  return base * 2 ** attempt + jitter;
}

// Initialize Firebase Admin using application default credentials.
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set to a service account JSON file,
// or use another supported method for admin credentials.
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment.');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COLLECTION = 'vinyls';
const MAX_RETRIES = 5;
const DELAY_BETWEEN_REQUESTS_MS = 250; // pace requests to avoid bursts

async function generateEmbeddingForText(text) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const resp = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      // new OpenAI client returns data array
      if (resp && resp.data && resp.data[0] && resp.data[0].embedding) {
        return resp.data[0].embedding;
      }
      throw new Error('Unexpected response from OpenAI embeddings API');
    } catch (err) {
      const isRateLimit = err && (err.status === 429 || (err.message && err.message.toLowerCase().includes('rate')));
      const wait = exponentialBackoff(attempt);
      console.warn(`Embedding request failed (attempt ${attempt + 1}): ${err?.message || err}`);
      if (attempt < MAX_RETRIES - 1) {
        console.log(`Waiting ${wait}ms before retrying...`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}

function docTextForEmbedding(data) {
  // Choose fields that represent the vinyl. Adjust as needed.
  const parts = [];
  if (data.title) parts.push(data.title);
  if (data.artist) parts.push(data.artist);
  if (data.description) parts.push(data.description);
  if (data.genre) parts.push(data.genre);
  if (data.tags && Array.isArray(data.tags)) parts.push(data.tags.join(' '));
  return parts.join('\n\n');
}

async function main() {
  const force = process.argv.includes('--force');
  console.log(`Starting embedding generation for collection "${COLLECTION}"${force ? ' (force mode)' : ''}`);

  const snapshot = await db.collection(COLLECTION).get();
  console.log(`Found ${snapshot.size} documents.`);

  let processed = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!force && data.embedding && Array.isArray(data.embedding) && data.embedding.length > 0) {
      console.log(`Skipping ${doc.id} — already has embedding.`);
      continue;
    }

    const text = docTextForEmbedding(data);
    if (!text || text.trim().length === 0) {
      console.log(`Skipping ${doc.id} — no text fields present to embed.`);
      continue;
    }

    try {
      const embedding = await generateEmbeddingForText(text);
      await db.collection(COLLECTION).doc(doc.id).update({ embedding });
      console.log(`Saved embedding for ${doc.id} (${embedding.length} dims)`);
      processed++;
    } catch (err) {
      console.error(`Failed to generate/save embedding for ${doc.id}:`, err?.message || err);
    }

    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  console.log(`Embedding generation complete. Processed: ${processed}/${snapshot.size}`);
}

main().catch((err) => {
  console.error('Unhandled error in embedding script:', err);
  process.exit(1);
});
