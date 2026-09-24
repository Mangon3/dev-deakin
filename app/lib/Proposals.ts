import { COLLECTIONS, db } from "./Firebase";

export type ProposalStatus = "pending" | "accepted" | "declined" | "withdrawn";

export type ProposalRecord = {
  id: string;
  jobId: string;
  devId: string;
  devName: string;
  note: string;
  quote: number;
  timeline: string;
  status: ProposalStatus;
  createdAt: string;
};

function toRecord(
  id: string,
  data: FirebaseFirestore.DocumentData
): ProposalRecord {
  return {
    id,
    jobId: data.jobId,
    devId: data.devId,
    devName: data.devName,
    note: data.note,
    quote: data.quote,
    timeline: data.timeline,
    status: data.status ?? "pending",
    createdAt: data.createdAt,
  };
}

export async function createProposal(proposal: {
  jobId: string;
  devId: string;
  devName: string;
  note: string;
  quote: number;
  timeline: string;
}): Promise<string> {
  const doc = await db.collection(COLLECTIONS.proposals).add({
    ...proposal,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return doc.id;
}

export async function findProposalById(
  id: string
): Promise<ProposalRecord | null> {
  const doc = await db.collection(COLLECTIONS.proposals).doc(id).get();

  if (!doc.exists) return null;

  return toRecord(doc.id, doc.data()!);
}

export async function listProposalsForJob(
  jobId: string
): Promise<ProposalRecord[]> {
  const snapshot = await db
    .collection(COLLECTIONS.proposals)
    .where("jobId", "==", jobId)
    .get();

  return snapshot.docs
    .map((doc) => toRecord(doc.id, doc.data()))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listProposalsByDev(
  devId: string
): Promise<ProposalRecord[]> {
  const snapshot = await db
    .collection(COLLECTIONS.proposals)
    .where("devId", "==", devId)
    .get();

  return snapshot.docs
    .map((doc) => toRecord(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// One proposal per developer per job
export async function findProposalByDev(
  jobId: string,
  devId: string
): Promise<ProposalRecord | null> {
  const snapshot = await db
    .collection(COLLECTIONS.proposals)
    .where("jobId", "==", jobId)
    .where("devId", "==", devId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return toRecord(snapshot.docs[0].id, snapshot.docs[0].data());
}

export async function setProposalStatus(
  id: string,
  status: ProposalStatus
): Promise<void> {
  await db.collection(COLLECTIONS.proposals).doc(id).update({ status });
}

// Every other proposal on the job is declined when one is accepted
export async function declineOthers(
  jobId: string,
  keepId: string
): Promise<void> {
  const others = await listProposalsForJob(jobId);
  const batch = db.batch();

  others
    .filter((p) => p.id !== keepId)
    .forEach((p) =>
      batch.update(db.collection(COLLECTIONS.proposals).doc(p.id), {
        status: "declined",
      })
    );

  await batch.commit();
}
