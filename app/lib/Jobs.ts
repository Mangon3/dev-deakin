import { COLLECTIONS, db } from "./Firebase";
import type { JobInput } from "./Validation";

export type JobStatus = "open" | "contracted" | "closed";

export type JobRecord = {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
  status: JobStatus;
  clientId: string;
  clientName: string;
  proposalCount: number;
  createdAt: string;
};

function toRecord(id: string, data: FirebaseFirestore.DocumentData): JobRecord {
  return {
    id,
    title: data.title,
    description: data.description,
    budget: data.budget,
    deadline: data.deadline,
    skills: Array.isArray(data.skills) ? data.skills : [],
    status: data.status ?? "open",
    clientId: data.clientId,
    clientName: data.clientName,
    proposalCount: data.proposalCount ?? 0,
    createdAt: data.createdAt,
  };
}

export async function createJob(
  job: Omit<JobInput, "skills"> & {
    skills: string[];
    clientId: string;
    clientName: string;
  }
): Promise<string> {
  const doc = await db.collection(COLLECTIONS.jobs).add({
    ...job,
    status: "open",
    proposalCount: 0,
    createdAt: new Date().toISOString(),
  });

  return doc.id;
}

export async function listJobs(limit = 100): Promise<JobRecord[]> {
  const snapshot = await db
    .collection(COLLECTIONS.jobs)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => toRecord(doc.id, doc.data()));
}

export async function findJobById(id: string): Promise<JobRecord | null> {
  const doc = await db.collection(COLLECTIONS.jobs).doc(id).get();

  if (!doc.exists) return null;

  return toRecord(doc.id, doc.data()!);
}

export async function listJobsByClient(clientId: string): Promise<JobRecord[]> {
  const snapshot = await db
    .collection(COLLECTIONS.jobs)
    .where("clientId", "==", clientId)
    .get();

  // Sorted here rather than in the query, which would need a composite index
  return snapshot.docs
    .map((doc) => toRecord(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function incrementProposalCount(jobId: string): Promise<void> {
  const ref = db.collection(COLLECTIONS.jobs).doc(jobId);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    tx.update(ref, { proposalCount: (doc.data()?.proposalCount ?? 0) + 1 });
  });
}

export async function setJobStatus(
  jobId: string,
  status: JobStatus
): Promise<void> {
  await db.collection(COLLECTIONS.jobs).doc(jobId).update({ status });
}
