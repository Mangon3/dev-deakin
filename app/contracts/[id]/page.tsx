import type { Metadata } from "next";

import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Contract from "./Contract";

export const metadata: Metadata = { title: "Title Placeholder" };

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-7">
        <Contract contractId={id} />
      </main>

      <Footer />
    </>
  );
}
