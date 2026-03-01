import admin from "firebase-admin";

let serviceAccount: admin.ServiceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production (Render): Load from secure environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable.");
    throw error;
  }
} else {
  // Local Development: Fallback to local file (ignored by git)
  try {
    // We use require to avoid TS compilation errors if the file doesn't exist
    // ES module static imports will fail the build immediately if the file is missing
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    serviceAccount = require("../../serviceAccountKey.json");
  } catch (error) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT env var AND serviceAccountKey.json file not found.");
    throw new Error("Firebase Service Account credentials not provided.");
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();