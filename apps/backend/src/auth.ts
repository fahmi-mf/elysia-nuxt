import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { openAPI, username, multiSession, twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import * as schema from "./db/schema";
import { sendVerificationEmail, sendResetPasswordEmail, sendDeleteAccountEmail } from "./lib/email";

export const auth = betterAuth({
  appName: "Elysia Nuxt App",
  baseURL: "http://localhost:4243",
  trustedOrigins: ["http://localhost:4243", "http://localhost:4242"],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: sendResetPasswordEmail,
    resetPasswordTokenExpiresIn: 3600,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: sendVerificationEmail,
  },
  user: {
    deleteUser: {
        enabled: true,
        sendDeleteAccountVerification: sendDeleteAccountEmail
    }
  },
  
  advanced: {
    cookiePrefix: "elysia-nuxt",
    useSecureCookies: process.env.NODE_ENV === 'production',
    
    defaultCookieAttributes: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        path: "/"
    }
  },

  plugins: [
    openAPI(),
    username(),
    multiSession({
      maximumSessions: 6
    }),
    passkey({
      rpID: "localhost", // Domain where it runs (localhost in dev)
      rpName: "Elysia Nuxt App", // Name the user will see in the browser/mobile
      origin: "http://localhost:4242", // Frontend URL (where registration occurs)
    }),
    twoFactor()
  ],
});