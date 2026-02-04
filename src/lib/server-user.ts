export function getCurrentUserId(): string {
  // Placeholder until NextAuth/Clerk session is wired.
  return process.env.DEMO_USER_ID ?? "demo-user";
}
