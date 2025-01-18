export const INTERVAL_IN_MIN = 30;
/** Varje 15:e sekund och varje 30:e minut. */
export const INTERVAL_IN_MS = INTERVAL_IN_MIN * (Deno.env.get("ENV") === "dev" ? 500 : 60_000);

/*
export const firebaseConfig = {
  apiKey: Deno.env.get("FBAPIKEY") ?? "",
  authDomain: Deno.env.get("FBAUTHDOMAIN") ?? "",
  projectId: Deno.env.get("FBPROJECTID") ?? "",
  storageBucket: Deno.env.get("FBSTORAGEBUCKET") ?? "",
  messagingSenderId: Deno.env.get("FBMESSAGINGSENDERID") ?? "",
  appId: Deno.env.get("FBAPPID") ?? "",
} as const;
*/
