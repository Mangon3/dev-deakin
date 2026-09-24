import { COLLECTIONS, db } from "./Firebase";

export type MilestoneState = "open" | "delivered" | "approved";

export type Milestone = {
  name: string;
  fee: number;
  state: MilestoneState;
};

export type ContractRecord = {
  id: string;
  jobId: string;
  jobTitle: string;
  proposalId: string;
  clientId: string;
  clientName: string;
  devId: string;
  devName: string;
  agreedPrice: number;
  timeline: string;
  milestones: Milestone[];
  status: "active" | "complete";
  createdAt: string;
};

// A new contract starts with three even milestones, which either party can
// rename later. The remainder goes on the final milestone so the fees always
// add back up to the agreed price.
function defaultMilestones(total: number): Milestone[] {
  const part = Math.floor(total / 3);

  return [
    { name: "Kick off and first deliverable", fee: part, state: "open" },
    { name: "Main build", fee: part, state: "open" },
    { name: "Handover", fee: total - part * 2, state: "open" },
  ];
}

export async function createContract(contract: {
  jobId: string;
  jobTitle: string;
  proposalId: string;
  clientId: string;
  clientName: string;
  devId: string;
  devName: string;
  agreedPrice: number;
  timeline: string;
}): Promise<string> {
  const doc = await db.collection(COLLECTIONS.contracts).add({
    ...contract,
    milestones: defaultMilestones(contract.agreedPrice),
    status: "active",
    createdAt: new Date().toISOString(),
  });

  return doc.id;
}

export async function findContractById(
  id: string
): Promise<ContractRecord | null> {
  const doc = await db.collection(COLLECTIONS.contracts).doc(id).get();

  if (!doc.exists) return null;

  return { id: doc.id, ...doc.data() } as ContractRecord;
}

export async function listContractsForUser(
  userId: string
): Promise<ContractRecord[]> {
  const [asClient, asDev] = await Promise.all([
    db.collection(COLLECTIONS.contracts).where("clientId", "==", userId).get(),
    db.collection(COLLECTIONS.contracts).where("devId", "==", userId).get(),
  ]);

  return [...asClient.docs, ...asDev.docs]
    .map((doc) => ({ id: doc.id, ...doc.data() }) as ContractRecord)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setMilestoneState(
  contractId: string,
  index: number,
  state: MilestoneState
): Promise<ContractRecord> {
  const ref = db.collection(COLLECTIONS.contracts).doc(contractId);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.data() as ContractRecord;
    const milestones = [...data.milestones];

    milestones[index] = { ...milestones[index], state };

    // The contract completes once every milestone is approved
    const status = milestones.every((m) => m.state === "approved")
      ? "complete"
      : "active";

    tx.update(ref, { milestones, status });

    return { ...data, id: contractId, milestones, status };
  });
}
