// ./types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      image?: string;
      email: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User {
    accessToken: string;
  }

  interface JWT {
    accessToken: string;
  }
}