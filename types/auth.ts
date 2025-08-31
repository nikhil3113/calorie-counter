
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    id?: string;
  }
}
