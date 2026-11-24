
"use client";

import { createAuthClient } from "better-auth/react";

import {
  adminClient,
  jwtClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Use the frontend origin.
  // Requests will pass through Next.js rewrites.
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : undefined),

  fetchOptions: {
    credentials: "include",
  },

  plugins: [
    adminClient(),
    jwtClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
