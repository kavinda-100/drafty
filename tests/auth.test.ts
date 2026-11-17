import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { proxy } from "@/proxy";

const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const temporaryEmail = `drafty-test-${randomUUID()}@example.com`;
const password = "DraftyTest123!";
const users = [
  { email: "bod@gmail.com", password: "DraftyBod123!" },
  { email: "jane@gmail.com", password: "DraftyJane123!" },
];

async function request(path: string, body?: object, cookie?: string) {
  return auth.handler(new Request(`${origin}/api/auth${path}`, {
    method: body ? "POST" : "GET",
    headers: { origin, ...(body ? { "content-type": "application/json" } : {}), ...(cookie ? { cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }));
}

function sessionCookie(response: Response) {
  const cookies = response.headers.getSetCookie();
  const session = cookies.find((cookie) => /(?:^|\.)session_token=/.test(cookie));
  expect(session).toBeDefined();
  return session!.split(";")[0];
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: temporaryEmail } });
  await prisma.$disconnect();
});

describe("email and password authentication", () => {
  it.each(users)("signs in, protects routes, and signs out $email", async (user) => {
    const login = await request("/sign-in/email", user);
    expect(login.status).toBe(200);
    const cookie = sessionCookie(login);
    const session = await request("/get-session", undefined, cookie);
    expect((await session.json()).user.email).toBe(user.email);
    const authPage = await proxy(new NextRequest(`${origin}/login`, { headers: { cookie } }));
    expect(new URL(authPage.headers.get("location")!).pathname).toBe("/");
    const protectedPage = await proxy(new NextRequest(`${origin}/`, { headers: { cookie } }));
    expect(protectedPage.status).toBe(200);
    const logout = await request("/sign-out", {}, cookie);
    expect(logout.status).toBe(200);
    const afterLogout = await request("/get-session", undefined, cookie);
    expect(await afterLogout.json()).toBeNull();
    const denied = await proxy(new NextRequest(`${origin}/`, { headers: { cookie } }));
    expect(denied.status).toBe(307);
    expect(new URL(denied.headers.get("location")!).pathname).toBe("/login");
  });

  it("registers a user and creates a session", async () => {
    const response = await request("/sign-up/email", { name: "Test User", email: temporaryEmail, password });
    expect(response.status).toBe(200);
    const session = await request("/get-session", undefined, sessionCookie(response));
    expect((await session.json()).user.email).toBe(temporaryEmail);
    const duplicate = await request("/sign-up/email", { name: "Test User", email: temporaryEmail, password });
    expect(duplicate.ok).toBe(false);
  });

  it("rejects incorrect credentials and anonymous requests", async () => {
    const response = await request("/sign-in/email", { email: users[0].email, password: "wrong-password" });
    expect(response.ok).toBe(false);
    const page = await proxy(new NextRequest(`${origin}/`));
    expect(page.status).toBe(307);
    expect(new URL(page.headers.get("location")!).pathname).toBe("/login");
    const invalidSession = await proxy(new NextRequest(`${origin}/`, { headers: { cookie: "better-auth.session_token=invalid" } }));
    expect(invalidSession.status).toBe(307);
    const api = await proxy(new NextRequest(`${origin}/api/private`));
    expect(api.status).toBe(401);
  });
});
