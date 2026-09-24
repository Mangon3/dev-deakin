import type { Metadata } from "next";

import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import JobDetail from "./JobDetail";

export const metadata: Metadata = { title: "Title Placeholder" };

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-7">
        <JobDetail jobId={id} />
      </main>

      <Footer />
    </>
  );
}
