import type { Metadata } from "next";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up | DEV@Deakin",
  description: "Create a free DEV@Deakin account.",
};

export default function SignUpPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <SignUpForm />
      </main>

      <Footer />
    </>
  );
}
