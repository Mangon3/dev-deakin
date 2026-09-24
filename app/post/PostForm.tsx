"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { z } from "zod";

import { useAuth } from "../context/AuthContext";
import { fileToDataUrl } from "../lib/Image";
import {
  MAX_TAGS,
  postSchema,
  splitTags,
  type PostPlan,
  type PostType,
} from "../lib/Validation";

const inputStyles =
  "w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors";

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? (
    <p className="mt-1 text-sm text-red-500">{messages[0]}</p>
  ) : null;
}

type Errors = Record<string, string[] | undefined>;

export default function PostForm() {
  const { token, user, ready } = useAuth();

  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [postType, setPostType] = useState<PostType>("question");
  const [postPlan, setPostPlan] = useState<PostPlan>("free");
  const [tags, setTags] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [image, setImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    const parsed = postSchema.safeParse({
      postType,
      postPlan,
      title: data.get("title"),
      tags: data.get("tags"),
      ...(postType === "question"
        ? { problem: data.get("problem") }
        : {
            abstract: data.get("abstract"),
            articleText: data.get("articleText"),
          }),
      ...(image ? { image } : {}),
    });

    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      setSuccess(false);
      setMessage("");
      return;
    }

    setPending(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed.data),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setErrors(body?.fields ?? {});
        setSuccess(false);
        setMessage(body?.error || "Could not save your post.");
        return;
      }

      setSuccess(true);
      setMessage(body.message);
      form.reset();
      setTags("");
      setImage("");
      setFileName("");
      setImageError("");
    } catch {
      setSuccess(false);
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const handleUpload = async (): Promise<void> => {
    const file = fileInput.current?.files?.[0];

    if (!file) {
      setImageError("Please choose an image first.");
      return;
    }

    setUploading(true);
    setImageError("");

    try {
      setImage(await fileToDataUrl(file));
    } catch (error) {
      setImage("");
      setImageError(
        error instanceof Error ? error.message : "Could not read that image."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (): void => {
    setImage("");
    setFileName("");
    setImageError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const tagCount = splitTags(tags).length;

  // Posting requires a logged in user
  if (ready && !user) {
    return (
      <div className="w-full max-w-3xl border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <h1 className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 font-bold border-b border-zinc-200 dark:border-zinc-800">
          New Post
        </h1>
        <div className="px-8 py-12 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            You need to be logged in to submit a question or article.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
          >
            Log in to post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-3xl border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
    >
      <h1 className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 font-bold border-b border-zinc-200 dark:border-zinc-800">
        New Post
      </h1>

      {/* Outcome banner */}
      {message && (
        <div
          role="status"
          className={`mx-8 mt-6 px-4 py-3 rounded-lg border text-sm font-semibold ${
            success
              ? "border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
              : "border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* Post type */}
      <div className="flex flex-wrap items-center gap-6 px-8 pt-4">
        <span className="text-sm font-semibold sm:w-32">Select Post Type:</span>
        {(["question", "article"] as const).map((type) => (
          <label
            key={type}
            className="flex items-center gap-2 text-sm capitalize cursor-pointer"
          >
            <input
              type="radio"
              name="postType"
              value={type}
              checked={postType === type}
              onChange={() => setPostType(type)}
              className="accent-teal-500 cursor-pointer"
            />
            {type}
          </label>
        ))}
      </div>

      {/* Post plan */}
      <div className="flex flex-wrap items-center gap-6 px-8 py-4">
        <span className="text-sm font-semibold sm:w-32">Select Post Plan:</span>
        {(["free", "paid"] as const).map((plan) => (
          <label
            key={plan}
            className="flex items-center gap-2 text-sm capitalize cursor-pointer"
          >
            <input
              type="radio"
              name="postPlan"
              value={plan}
              checked={postPlan === plan}
              onChange={() => setPostPlan(plan)}
              className="accent-teal-500 cursor-pointer"
            />
            {plan}
          </label>
        ))}
        <FieldError messages={errors.postPlan} />
      </div>

      <h2 className="px-8 py-2 bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold border-y border-zinc-200 dark:border-zinc-800">
        What do you want to ask or share
      </h2>

      <p className="px-8 pt-4 text-sm text-zinc-600 dark:text-zinc-400">
        This section is designed based on the type of the post. It could be
        developed by conditional rendering.{" "}
        <span className="text-red-500">
          {postType === "question"
            ? "For post a question, the following section would be appeared."
            : "For post an article, the following section would be appeared."}
        </span>
      </p>

      <div className="flex flex-col gap-5 px-8 py-6">
        {/* Title */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="title" className="text-sm sm:w-24 sm:shrink-0">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder={
                postType === "question"
                  ? "Start your question with how, what, why, etc."
                  : "Enter a descriptive title"
              }
              className={inputStyles}
            />
          </div>
          <FieldError messages={errors.title} />
        </div>

        {/* Image */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <label className="text-sm sm:w-24 sm:shrink-0 sm:pt-2">
              Add an image:
            </label>
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={fileName}
                  placeholder="No file selected"
                  className={`${inputStyles} cursor-default`}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                >
                  Browse
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || !fileName}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? "..." : "Upload"}
                </button>
              </div>

              {/* Hidden until Browse is clicked */}
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  setFileName(event.target.files?.[0]?.name ?? "");
                  setImage("");
                  setImageError("");
                }}
                className="hidden"
              />

              {image && (
                <div className="mt-3 flex items-center gap-3">
                  <Image
                    src={image}
                    alt="Selected image preview"
                    width={96}
                    height={96}
                    unoptimized
                    className="w-24 h-24 object-cover rounded-lg border border-zinc-300 dark:border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-sm text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {imageError && (
                <p className="mt-1 text-sm text-red-500">{imageError}</p>
              )}
              <FieldError messages={errors.image} />
            </div>
          </div>
          {/* The data URL travels with the form */}
          <input type="hidden" name="image" value={image} />
        </div>

        {/* Question or article fields */}
        {postType === "question" ? (
          <div>
            <label htmlFor="problem" className="block text-sm mb-1">
              Describe your problem
            </label>
            <textarea
              id="problem"
              name="problem"
              rows={12}
              placeholder="Describe what you tried, what you expected, and what happened instead."
              className={`${inputStyles} resize-y`}
            />
            <FieldError messages={errors.problem} />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="abstract" className="block text-sm mb-1">
                Abstract
              </label>
              <textarea
                id="abstract"
                name="abstract"
                rows={3}
                placeholder="Enter a 1-paragraph abstract"
                className={`${inputStyles} resize-y`}
              />
              <FieldError messages={errors.abstract} />
            </div>

            <div>
              <label htmlFor="articleText" className="block text-sm mb-1">
                Article Text
              </label>
              <textarea
                id="articleText"
                name="articleText"
                rows={9}
                placeholder="Enter the full text of your article"
                className={`${inputStyles} resize-y`}
              />
              <FieldError messages={errors.articleText} />
            </div>
          </>
        )}

        {/* Tags */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="tags" className="text-sm sm:w-24 sm:shrink-0">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder={`Please add up to ${MAX_TAGS} tags to describe what your ${postType} is about e.g., Java`}
              className={inputStyles}
            />
          </div>
          <FieldError messages={errors.tags} />
          {tagCount > 0 && !errors.tags && (
            <p className="mt-1 text-sm text-zinc-500 sm:ml-24 sm:pl-2">
              {tagCount} of {MAX_TAGS} tags used
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end px-8 pb-6">
        <button
          type="submit"
          disabled={pending}
          className="px-8 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
