import type { Metadata } from "next";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PostForm from "./PostForm";

export const metadata: Metadata = {
  title: "New Post | DEV@Deakin",
  description: "Post a question or share an article with the DEV@Deakin community.",
};

export default function PostPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 flex justify-center px-8 py-12">
        <PostForm />
      </main>

      <Footer />
    </>
  );
}
