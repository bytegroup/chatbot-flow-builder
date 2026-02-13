import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: string;
    user: {
      name?: string | null;
      email?: string | null;
      role: string;
    };
  }

  interface User {
    accessToken: string;
    refreshToken: string;
    role: string;
  }
}