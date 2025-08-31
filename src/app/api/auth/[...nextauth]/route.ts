/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SubscriptionService } from "@/lib/subscriptionService";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          // ユーザー情報をデータベースに保存
          await SubscriptionService.findOrCreateUser(
            user.email,
            user.name || undefined,
            user.image || undefined
          );
          return true;
        } catch (error) {
          console.error("ユーザー作成エラー:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
