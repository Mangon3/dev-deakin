import type { Metadata } from "next";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import BrowseList from "./BrowseList";

export const metadata: Metadata = {
  title: "Browse Posts | DEV@Deakin",
  description: "Questions and articles submitted by the DEV@Deakin community.",
};

export default function BrowsePage() {
  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold mb-1">Browse Posts</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
          Questions and articles submitted.
        </p>

        {/* Posts are fetched from the API so the backend decides what is visible */}
        <BrowseList />
      </main>

      <Footer />
    </>
  );
}
