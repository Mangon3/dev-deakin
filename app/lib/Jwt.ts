import { jwtVerify, SignJWT } from "jose";

import type { UserPlan } from "./Users";

const EXPIRY = "7d";

export type TokenPayload = {
  sub: string;
  name: string;
  email: string;
  plan: UserPlan;
};

function secret(): Uint8Array {
  const value = process.env.JWT_SECRET;

  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 characters.");
  }

  return new TextEncoder().encode(value);
}

// Signs the session token
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret());
}

// Bad token counts as visitor
export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());

    return {
      sub: String(payload.sub),
      name: String(payload.name),
      email: String(payload.email),
      plan: payload.plan === "paid" ? "paid" : "free",
    };
  } catch {
    return null;
  }
}

// Reads the bearer token
export async function userFromRequest(
  request: Request
): Promise<TokenPayload | null> {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) return null;

  return verifyToken(header.slice(7));
}
