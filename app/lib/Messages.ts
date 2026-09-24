import { COLLECTIONS, db } from "./Firebase";

export type MessageRecord = {
  id: string;
  proposalId: string;
  fromId: string;
  fromName: string;
  text: string;
  createdAt: string;
};

export async function listMessages(
  proposalId: string
): Promise<MessageRecord[]> {
  const snapshot = await db
    .collection(COLLECTIONS.messages)
    .where("proposalId", "==", proposalId)
    .get();

  // Sorted in memory, which avoids needing a composite index
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as MessageRecord)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createMessage(message: {
  proposalId: string;
  fromId: string;
  fromName: string;
  text: string;
}): Promise<MessageRecord> {
  const createdAt = new Date().toISOString();
  const doc = await db
    .collection(COLLECTIONS.messages)
    .add({ ...message, createdAt });

  return { id: doc.id, createdAt, ...message };
}
