
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearchPkg = require('algoliasearch');
const algoliasearch = algoliasearchPkg && (algoliasearchPkg.algoliasearch || algoliasearchPkg.default) ? (algoliasearchPkg.algoliasearch || algoliasearchPkg.default) : algoliasearchPkg;


admin.initializeApp();

// Safely read Algolia credentials from environment variables or legacy functions config.
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || (functions.config && functions.config().algolia && functions.config().algolia.app_id) || '';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || (functions.config && functions.config().algolia && functions.config().algolia.api_key) || '';

let index = null;
if (ALGOLIA_APP_ID && ALGOLIA_ADMIN_KEY) {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  index = client.initIndex('vinyls');
} else {
  console.warn('Algolia credentials not found. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY.');
}

// Use v2 Firestore triggers (create / update / delete)
const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore');

const handleSave = async (objectID, record) => {
  if (!index) {
    console.warn('Algolia index not initialized; skipping sync.');
    return;
  }
  try {
    await index.saveObject({ ...record, objectID });
    console.log(`Vinyl ${objectID} synced to Algolia.`);
  } catch (err) {
    console.error('Algolia save error:', err);
  }
};

const handleDelete = async (objectID) => {
  if (!index) {
    console.warn('Algolia index not initialized; skipping delete.');
    return;
  }
  try {
    await index.deleteObject(objectID);
    console.log(`Vinyl ${objectID} removed from Algolia.`);
  } catch (err) {
    console.error('Algolia delete error:', err);
  }
};

exports.vinylCreated = onDocumentCreated('vinyls/{vinylId}', async (event) => {
  const snapshot = event.data;
  const vinyl = snapshot.data();
  const objectID = event.params.vinylId;
  await handleSave(objectID, vinyl);
});

exports.vinylUpdated = onDocumentUpdated('vinyls/{vinylId}', async (event) => {
  const change = event.data;
  const after = change.after ? change.after.data() : null;
  const objectID = event.params.vinylId;
  if (after) await handleSave(objectID, after);
});

exports.vinylDeleted = onDocumentDeleted('vinyls/{vinylId}', async (event) => {
  const objectID = event.params.vinylId;
  await handleDelete(objectID);
});