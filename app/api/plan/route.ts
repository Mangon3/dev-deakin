import { NextResponse } from "next/server";
import { z } from "zod";

import { signToken, userFromRequest } from "../../lib/Jwt";
import { findUserById, upgradeUserPlan } from "../../lib/Users";
import { paymentSchema } from "../../lib/Validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Only logged in users may upgrade
  const user = await userFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Please log in to upgrade your plan." },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  // Validate payment details
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check your payment details.",
        fields: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const current = await findUserById(user.sub);

    if (!current) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    // Already on the Paid plan
    if (current.plan === "paid") {
      return NextResponse.json(
        { error: "You are already on the Paid plan." },
        { status: 409 }
      );
    }

    // Upgrade saved, card details discarded
    await upgradeUserPlan(current.id);

    // Fresh token carries the new plan
    const token = await signToken({
      sub: current.id,
      name: current.name,
      email: current.email,
      plan: "paid",
    });

    return NextResponse.json(
      { token, message: "You are now on the Paid plan." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Plan upgrade failed:", error);

    return NextResponse.json(
      { error: "Could not upgrade your plan. Please try again." },
      { status: 500 }
    );
  }
}
