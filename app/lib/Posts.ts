import { db } from "./Firebase";
import type { UserPlan } from "./Users";
import type { PostPlan, PostType } from "./Validation";

const POSTS = "posts";

export type PostRecord = {
  id: string;
  postType: PostType;
  postPlan: PostPlan;
  title: string;
  tags: string[];
  problem?: string;
  abstract?: string;
  articleText?: string;
  image?: string;
  createdAt: string;
  authorId: string;
  authorName: string;
};

export type NewPost = Omit<PostRecord, "id" | "createdAt">;

export async function createPost(post: NewPost): Promise<string> {
  // Firestore rejects undefined values
  const doc = await db.collection(POSTS).add({
    ...post,
    createdAt: new Date().toISOString(),
  });

  return doc.id;
}

// Paid posts filtered in the backend
export async function listPostsForPlan(
  plan: UserPlan,
  limit = 100
): Promise<PostRecord[]> {
  // Filtered here, avoids a composite index
  const snapshot = await db
    .collection(POSTS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  const docs =
    plan === "paid"
      ? snapshot.docs
      : snapshot.docs.filter((doc) => doc.data().postPlan !== "paid");

  return docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      postType: data.postType,
      postPlan: data.postPlan,
      title: data.title,
      tags: Array.isArray(data.tags) ? data.tags : [],
      problem: data.problem,
      abstract: data.abstract,
      articleText: data.articleText,
      image: data.image,
      createdAt: data.createdAt,
      authorId: data.authorId ?? "",
      authorName: data.authorName ?? "Unknown",
    };
  });
}
