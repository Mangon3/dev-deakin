import { db } from "./Firebase";

const USERS = "users";

export type UserPlan = "free" | "paid";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  plan: UserPlan;
  skills: string[];
  rating: number | null;
  contractsCompleted: number;
};

// Emails are matched case-insensitively
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Accounts created before plans existed default to free
function toRecord(id: string, data: FirebaseFirestore.DocumentData): UserRecord {
  return {
    id,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    plan: data.plan === "paid" ? "paid" : "free",
    skills: Array.isArray(data.skills) ? data.skills : [],
    rating: typeof data.rating === "number" ? data.rating : null,
    contractsCompleted: data.contractsCompleted ?? 0,
  };
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  const snapshot = await db
    .collection(USERS)
    .where("email", "==", normaliseEmail(email))
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return toRecord(snapshot.docs[0].id, snapshot.docs[0].data());
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const doc = await db.collection(USERS).doc(id).get();

  if (!doc.exists) return null;

  return toRecord(doc.id, doc.data()!);
}

export async function createUser(user: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<string> {
  const doc = await db.collection(USERS).add({
    name: user.name,
    email: normaliseEmail(user.email),
    passwordHash: user.passwordHash,
    plan: "free",
    skills: [],
    rating: null,
    contractsCompleted: 0,
    createdAt: new Date().toISOString(),
  });

  return doc.id;
}

export async function upgradeUserPlan(id: string): Promise<void> {
  await db.collection(USERS).doc(id).update({
    plan: "paid",
    upgradedAt: new Date().toISOString(),
  });
}
