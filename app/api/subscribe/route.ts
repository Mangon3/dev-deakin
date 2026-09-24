import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { z } from "zod";

import { subscribeSchema } from "../../lib/Validation";

export const runtime = "nodejs";
export const maxDuration = 30;

const transporter = nodemailer.createTransport({  // nodemailer
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  let body: unknown;

  // Unparseable JSON
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  // Validate before touching email API
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors;
    console.warn("Rejected subscribe request:", fields);

    return NextResponse.json(
      {
        error: fields.email?.[0] || "Please check the details you entered.",
        fields,
      },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to DEV@Deakin!",
      text: "Thanks for subscribing! You'll now receive our daily insider.",
    });

    // Gmail's SMTP acknowledgement
    console.log("Email API response:", info.response);
    console.log("Accepted recipients:", info.accepted);

    return NextResponse.json(
      { message: `Welcome email sent to ${email}. Check your inbox!` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);

    // Provider fails
    return NextResponse.json(
      { error: "We couldn't send the welcome email right now. Please try again." },
      { status: 502 }
    );
  }
}
