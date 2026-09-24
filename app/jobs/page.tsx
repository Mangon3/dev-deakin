import type { Metadata } from "next";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { listJobs } from "../lib/Jobs";
import JobList from "./JobList";

export const metadata: Metadata = { title: "Title Placeholder" };

// Always current, since jobs are posted while people are browsing
export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-7">
        <h1 className="text-xl font-semibold mb-1">Job List</h1>
        <p className="text-sm text-dim mb-6">Select a job you want to apply</p>

        <JobList jobs={jobs} />
      </main>

      <Footer />
    </>
  );
}
