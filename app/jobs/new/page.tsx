import type { Metadata } from "next";

import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import NewJobForm from "./NewJobForm";

export const metadata: Metadata = { title: "Title Placeholder" };

export default function NewJobPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-7">
        <h1 className="text-xl font-semibold mb-1">Heading Placeholder</h1>
        <p className="text-sm text-dim mb-6">Subtitle placeholder text.</p>

        <NewJobForm />
      </main>

      <Footer />
    </>
  );
}
