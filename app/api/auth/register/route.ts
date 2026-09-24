import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createUser, findUserByEmail, normaliseEmail } from "../../../lib/Users";
import { signUpSchema } from "../../../lib/Validation";

export const runtime = "nodejs";

const SALT_ROUNDS = 10;

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

  // Backend validates received data
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the details you entered.", fields: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  try {
    if (await findUserByEmail(email)) {
      // Account already exists
      return NextResponse.json(
        {
          error: "An account with that email already exists.",
          fields: { email: ["An account with that email already exists."] },
        },
        { status: 409 }
      );
    }

    // Hash before storing in Firestore
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await createUser({ name, email: normaliseEmail(email), passwordHash });

    return NextResponse.json(
      { message: "Account created. You can now log in." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration failed:", error);

    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 }
    );
  }
}
