import * as admin from "firebase-admin";

let serverDb: admin.firestore.Firestore | null = null;
let serverAuth: admin.auth.Auth | null = null;

try {
  if (!admin.apps.length) {
    // If service account env is provided, parse it
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lapor-aman-web-2026",
      });
    } else {
      // Initialize with application default or project ID
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lapor-aman-web-2026",
      });
    }
  }
  serverDb = admin.firestore();
  serverAuth = admin.auth();
} catch (e) {
  console.warn("Firebase Admin SDK init warning (falling back to client or preview mode):", e);
}

export { serverDb, serverAuth, admin };
