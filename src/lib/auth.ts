import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SubscriptionService } from "@/lib/subscriptionService";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // ユーザー情報をデータベースに保存
          await SubscriptionService.findOrCreateUser(
            user.email,
            user.name || undefined,
            user.image || undefined
          );
          return true;
        } catch (error: unknown) {
          console.error("ユーザー作成エラー:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};
