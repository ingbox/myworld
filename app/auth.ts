// auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function getRoleFromEmail(email?: string): "ADMIN" | "USER" {
  return email === "ingbox01@gmail.com" ? "ADMIN" : "USER";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture, // ← 이미지 필드 포함!
          role: getRoleFromEmail(profile.email),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.picture = (user as any).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // session.user.role = token.role as "ADMIN" | "USER";
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});