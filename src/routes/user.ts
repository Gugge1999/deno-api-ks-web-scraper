import { httpErrors } from "@oak/oak";
import { Router } from "@oak/oak/router";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { Buffer } from "node:buffer";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { getUserByEmail, insertNewUser } from "../database/user.ts";
import { validateBody } from "./bevakningar.ts";
import { keyLength } from "../constants/config.ts";
import { errorLogger } from "../services/logger.ts";

// TODO: Den här borde sättas i .env
const secret = new TextEncoder().encode("secret-that-no-one-knows");

const userRoutes = new Router({
  prefix: "/api/user",
});

userRoutes.post(`/register`, async (context) => {
  const { email, password } = await validateBodyUser(context);

  if (password.length < 5) {
    throw new httpErrors.BadRequest("Lösenordet måste vara minst 5 tecken långt");
  }

  const hashedPassword = hash(password);
  const newUser = await insertNewUser(email, hashedPassword);

  if (
    newUser?.error && typeof newUser.error === "object" && "routine" in newUser.error && newUser.error.routine === "_bt_check_unique"
  ) {
    throw new httpErrors.BadRequest(`Användare med email: ${email} finns redan`);
  }

  if (newUser.error || newUser.result?.length === 0) {
    throw new httpErrors.InternalServerError(`Kunde inte skapa användare dbError: ${newUser.error}`);
  }

  // TODO: Ska det vara en random guid eller id från app_user?
  const token = await createJwt({ userId: 123, username: "john_doe" });

  context.cookies.set("jwt", token, { httpOnly: true });

  context.response.body = newUser.result?.[0];
});

// TODO: Vid inloggning bör inte jwt finnas. När man loggar in borde den sättas
userRoutes.post(`/login`, async (context) => {
  const { email, password } = await validateBodyUser(context);

  const jwtToken = await context.cookies.get("jwt");

  if (jwtToken === undefined) {
    throw new httpErrors.Unauthorized("Ingen jwt token hittades");
  }

  const jwtVerified = await verifyJwt(jwtToken);

  if (jwtVerified === null) {
    throw new httpErrors.Unauthorized("Ogiltig jwt token");
  }

  const user = await getUserByEmail(email);

  if (user.error) {
    throw new httpErrors.Unauthorized("Kunde inte hämta användare");
  }

  if (user.result?.length === 0) {
    throw new httpErrors.BadRequest("Email finns inte registered");
  }

  const passwordMatches = comparePasswords(password, user.result?.[0].password ?? "");

  if (!passwordMatches) {
    throw new httpErrors.BadRequest("Ogiltigt användarnamn eller lösenord");
  }

  context.response.body = "";
});

// TODO: Skapa endpoint för att logga ut, glömt lösenord, uppdatera lösenord och radera användare
function hash(password: string): string {
  try {
    // generate random 16 bytes long salt - recommended by NodeJS Docs
    const salt = randomBytes(16).toString("hex");
    const derivedKey = scryptSync(password, salt, keyLength);

    return `${salt}.${derivedKey.toString("hex")}`;
  } catch (e) {
    errorLogger.error({ message: `Något gick fel vid hashande av lösenord: Error: ${e}` });

    return "";
  }
}

function comparePasswords(password: string, hash: string): boolean {
  try {
    const [salt, hashKey] = hash.split(".");
    const hashKeyBuff = Buffer.from(hashKey, "hex");
    const derivedKey = scryptSync(password, salt, keyLength);
    return timingSafeEqual(hashKeyBuff, derivedKey);
  } catch (e) {
    errorLogger.error({ message: `Något gick fel vid jämförande av lösenord: Error: ${e}` });

    return false;
  }
}

async function createJwt(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return jwt;
}

async function verifyJwt(token: string | undefined): Promise<JWTPayload | null> {
  try {
    if (token === undefined) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    errorLogger.error({ message: `Ogiltig jwt token. dbError: ${error}` });

    return null;
  }
}

// TODO: Typa bättre, kanske unknown?
async function validateBodyUser(context: any) {
  await validateBody(context);

  const { email, password }: {
    email?: string;
    password?: string;
  } = await context.request.body.json();

  if (email === undefined || password === undefined) {
    throw new httpErrors.UnprocessableEntity("email och password behöver finnas i body");
  }

  return { email, password };
}

export default userRoutes;
