import type { Metadata } from "next";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PricingPlans from "./PricingPlans";

export const metadata: Metadata = {
  title: "Pricing | DEV@Deakin",
  description: "Compare the Free and Paid DEV@Deakin plans.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-8 py-12">
        <h1 className="text-2xl font-bold mb-1">Pricing</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
          Choose the plan that suits how you use DEV@Deakin.
        </p>

        <PricingPlans />
      </main>

      <Footer />
    </>
  );
}
