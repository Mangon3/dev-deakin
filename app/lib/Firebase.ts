import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill in your Firebase service account details.`
    );
  }
  return value;
}

// Reuse app across hot reloads
const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId: requireEnv("FIREBASE_PROJECT_ID"),
        clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
        // Env files escape newlines
        privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    });

export const db = getFirestore(app);

export const COLLECTIONS = {
  users: "users",
  posts: "posts",
  jobs: "jobs",
  proposals: "proposals",
  messages: "messages",
  contracts: "contracts",
} as const;
