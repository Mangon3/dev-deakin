import { NextResponse } from "next/server";
import { z } from "zod";

// Shared response helpers, so every route reports failures the same way.

export function fail(message: string, status: number, fields?: unknown) {
  return NextResponse.json({ error: message, fields }, { status });
}

export function ok<T extends object>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

// Reads and parses a JSON body, returning null when it is not valid JSON
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors;
}
