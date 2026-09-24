import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { signToken } from "../../../lib/Jwt";
import { findUserByEmail } from "../../../lib/Users";
import { loginSchema } from "../../../lib/Validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter your email and password." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  try {
    const user = await findUserByEmail(email);

    // Verify against the stored hash
    const valid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    // Same message prevents account enumeration
    if (!valid || !user) {
      return NextResponse.json(
        { error: "Those details don't match an account." },
        { status: 401 }
      );
    }

    // Signed JWT returned to the frontend
    const token = await signToken({
      sub: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
    });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      { error: "Could not log you in right now. Please try again." },
      { status: 500 }
    );
  }
}
