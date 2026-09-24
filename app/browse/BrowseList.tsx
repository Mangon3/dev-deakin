"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import type { PostRecord } from "../lib/Posts";

const PREVIEW_LENGTH = 180;

const selectStyles =
  "px-3 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-teal-500 transition-colors";

// Full text depends on type
function bodyOf(post: PostRecord): string {
  if (post.postType === "question") return post.problem ?? "";
  return [post.abstract, post.articleText].filter(Boolean).join("\n\n");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      {children}
    </span>
  );
}

export default function BrowseList() {
  const { token, ready } = useAuth();

  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Refetches on login or logout
  useEffect(() => {
    if (!ready) return;

    let active = true;
    // Fetching on mount is intended
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetch("/api/posts", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok) {
          setLoadError(data?.error || "Could not load posts.");
          return;
        }

        setPosts(data.posts);
        setLoadError("");
      })
      .catch(() => {
        if (active) setLoadError("Could not reach the server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, ready]);

  const [type, setType] = useState("all");
  const [plan, setPlan] = useState("all");
  const [tag, setTag] = useState("");
  const [since, setSince] = useState("");
  const [sort, setSort] = useState("newest");

  // Hiding, separate from firestore
  const [hidden, setHidden] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (list: string[], id: string): string[] =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  const visible = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (hidden.includes(post.id)) return false;
      if (type !== "all" && post.postType !== type) return false;
      if (plan !== "all" && post.postPlan !== plan) return false;

      if (tag.trim()) {
        const wanted = tag.trim().toLowerCase();
        if (!post.tags.some((each) => each.toLowerCase().includes(wanted))) {
          return false;
        }
      }

      if (since && post.createdAt.slice(0, 10) < since) return false;

      return true;
    });

    return filtered.sort((a, b) =>
      sort === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt)
    );
  }, [posts, hidden, type, plan, tag, since, sort]);

  const reset = (): void => {
    setType("all");
    setPlan("all");
    setTag("");
    setSince("");
    setSort("newest");
    setHidden([]);
    setExpanded([]);
  };

  const filtersActive =
    type !== "all" ||
    plan !== "all" ||
    tag.trim() !== "" ||
    since !== "" ||
    sort !== "newest" ||
    hidden.length > 0;

  if (loading) {
    return <p className="py-12 text-center text-zinc-500">Loading posts...</p>;
  }

  if (loadError) {
    return <p className="py-12 text-center text-red-500">{loadError}</p>;
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={selectStyles}
          >
            <option value="all">All types</option>
            <option value="question">Questions</option>
            <option value="article">Articles</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Plan
          <select
            value={plan}
            onChange={(event) => setPlan(event.target.value)}
            className={selectStyles}
          >
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Tag
          <input
            type="text"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="e.g. Java"
            className={selectStyles}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Posted on or after
          <input
            type="date"
            value={since}
            onChange={(event) => setSince(event.target.value)}
            className={selectStyles}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className={selectStyles}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <button
          type="button"
          onClick={reset}
          disabled={!filtersActive}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-40 cursor-pointer"
        >
          Reset
        </button>
      </div>

      <p className="text-sm text-zinc-500 mb-4">
        Showing {visible.length} of {posts.length} posts
        {hidden.length > 0 && ` (${hidden.length} hidden)`}
      </p>

      {/* Posts */}
      {visible.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">
          {posts.length === 0
            ? "No posts yet. Create one from the Post page."
            : "No posts match your filters."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((post) => {
            const body = bodyOf(post);
            const isExpanded = expanded.includes(post.id);
            const needsExpanding = body.length > PREVIEW_LENGTH;

            return (
              <li
                key={post.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge>{post.postType}</Badge>
                  <Badge>{post.postPlan}</Badge>
                  <span className="text-xs text-zinc-500">
                    {formatDate(post.createdAt)}
                    {post.authorName && ` by ${post.authorName}`}
                  </span>
                </div>

                <h2 className="font-semibold mb-2 break-words">{post.title}</h2>

                <div className="flex gap-4">
                  {post.image && (
                    <Image
                      src={post.image}
                      alt=""
                      width={112}
                      height={112}
                      unoptimized
                      className={`object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0 ${
                        isExpanded ? "w-48 h-48" : "w-28 h-28"
                      }`}
                    />
                  )}

                  {/* min-w-0 lets the flex item shrink, break-words splits
                      long unbroken strings instead of overflowing the card */}
                  <p className="min-w-0 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words">
                    {isExpanded || !needsExpanding
                      ? body
                      : `${body.slice(0, PREVIEW_LENGTH).trimEnd()}...`}
                  </p>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((each) => (
                      <span
                        key={each}
                        className="px-2 py-0.5 text-xs rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                      >
                        {each}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 mt-4 text-sm">
                  {needsExpanding && (
                    <button
                      type="button"
                      onClick={() => setExpanded((c) => toggle(c, post.id))}
                      className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      {isExpanded ? "Show less" : "Expand"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setHidden((c) => toggle(c, post.id))}
                    className="text-zinc-500 hover:underline cursor-pointer"
                  >
                    Hide
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
