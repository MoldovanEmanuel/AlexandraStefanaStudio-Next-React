import * as crypto from "crypto";
import { cookies } from "next/headers";
import { signJwt, verifyJwt } from "./jwt";
import type { JwtPayload } from "@/types";

const COOKIE_NAME = "admin-token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// ── Password hashing (scrypt — no bcrypt dependency) ─────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, storedKey] = hash.split(":");
    if (!salt || !storedKey) return resolve(false);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex") === storedKey);
    });
  });
}

// ── Cookie management ─────────────────────────────────────────────────────────

export async function setAuthCookie(
  payload: JwtPayload,
  remember = false,
): Promise<void> {
  const token = await signJwt(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: remember ? COOKIE_MAX_AGE : undefined,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function getAuthPayload(): Promise<JwtPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyJwt(token);
}

export async function requireAuth(): Promise<JwtPayload> {
  const payload = await getAuthPayload();
  if (!payload) {
    throw new Error("Unauthorized");
  }
  return payload;
}
