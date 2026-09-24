import type { Metadata } from "next";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SeekDemo from "../components/SeekDemo";
import { Notice } from "../components/Ui";

export const metadata: Metadata = { title: "Seek demo" };

export default function SeekDemoPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-7">
        <h1 className="text-xl font-semibold mb-1">Seek</h1>
        <p className="text-sm text-dim mb-5">
          The assistant runs three steps: it plans which tools to use, runs
          them, then writes an answer from their results.
        </p>

        <div className="mb-5">
          <Notice title="Demonstration mode.">
            This panel runs the same steps and the same two tools against real
            job data, with the planning and wording scripted so it works without
            a model key. The live assistant is the button in the corner.
          </Notice>
        </div>

        <SeekDemo />
      </main>

      <Footer />
    </>
  );
}
