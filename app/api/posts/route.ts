import { NextResponse } from "next/server";
import { z } from "zod";

import { userFromRequest } from "../../lib/Jwt";
import { createPost, listPostsForPlan } from "../../lib/Posts";
import { postSchema, splitTags } from "../../lib/Validation";

export const runtime = "nodejs";

// Backend decides what each plan sees
export async function GET(request: Request) {
  const user = await userFromRequest(request);

  try {
    const posts = await listPostsForPlan(user?.plan ?? "free");

    return NextResponse.json({ posts, plan: user?.plan ?? "free" }, { status: 200 });
  } catch (error) {
    console.error("Could not load posts:", error);

    return NextResponse.json({ error: "Could not load posts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await userFromRequest(request);

  // Posting requires a session
  if (!user) {
    return NextResponse.json(
      { error: "Please log in to submit a post." },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the details you entered.",
        fields: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const id = await createPost({
      ...parsed.data,
      tags: splitTags(parsed.data.tags),
      authorId: user.sub,
      authorName: user.name,
    });

    return NextResponse.json(
      { id, message: "Post Received - your post has been saved." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Could not save post:", error);

    return NextResponse.json(
      { error: "Could not save your post. Please try again." },
      { status: 500 }
    );
  }
}
