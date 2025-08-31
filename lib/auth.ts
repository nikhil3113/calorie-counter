import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
 import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user doesn't exist, create them
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                image: user.image || "",
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error creating user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.id = token.id as string;
      }
      return session;
    },
  },
};
