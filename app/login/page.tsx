import type { Metadata } from "next";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | DEV@Deakin",
  description: "Log in to your DEV@Deakin account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { registered } = await searchParams;

  return (
    <>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <LoginForm registered={registered === "1"} />
      </main>

      <Footer />
    </>
  );
}
