import { httpErrors } from "@oak/oak";
import { Router } from "@oak/oak/router";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { validate } from "jsr:@std/uuid";
import { Buffer } from "node:buffer";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, validatePassword } from "npm:@firebase/auth@1.8.1";

import { deleteUserById, getUserByEmail, getUserById } from "../database/user.ts";
import { errorLogger } from "../services/logger.ts";
import { validateBody } from "./bevakningar.ts";
// import { fbApp } from "../main.ts";
import { FirebaseError } from "npm:@firebase/app@0.10.17";

// TODO: Den här borde sättas i .env
const secret = new TextEncoder().encode("secret-that-no-one-knows");
const keyLength = 32;
const ACCESS_TOKEN_CONST = "access_token";

const userRoutes = new Router({
  prefix: "/api/user",
});

userRoutes.post(`/register`, async (context) => {
  const { email, password } = await validateBodyUser(context);

  // if (password.length < 6) {
  //   throw new httpErrors.BadRequest("Lösenordet måste vara minst 5 tecken långt");
  // }
  //
  // const hashedPassword = hashPassword(password);
  // const newUser = await insertNewUser(username, email, hashedPassword);
  //
  // if (
  //   newUser?.error && typeof newUser.error === "object" && "constraint_name" in newUser.error &&
  //   newUser.error.constraint_name
  // ) {
  //   if (newUser.error.constraint_name === "unique_email") {
  //     throw new httpErrors.BadRequest(`Användare med email: ${email} finns redan`);
  //   }
  //
  //   if (newUser.error.constraint_name === "unique_username") {
  //     throw new httpErrors.BadRequest(`Användare med användarnamn: ${username} finns redan`);
  //   }
  // }

  // TODO: Ska den vara i config så att den inte anropas varje gång i en endpoint?
  // const auth = getAuth(fbApp);

  // Mer info finns här: https://firebase.google.com/docs/auth/web/password-auth#policy
  // const status = await validatePassword(auth, password);
  // if (!status.isValid) {
  //   if (!status.meetsMinPasswordLength) {
  //     throw new httpErrors.UnprocessableEntity(
  //       `Lösenordet måste vara minst: ${status.passwordPolicy.customStrengthOptions.minPasswordLength} tecken`,
  //     );
  //   }
  //
  //   if (!status.meetsMaxPasswordLength) {
  //     throw new httpErrors.UnprocessableEntity(
  //       `Lösenordet får max vara: ${status.passwordPolicy.customStrengthOptions.maxPasswordLength} tecken`,
  //     );
  //   }
  // }

  // try {
  //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  //   // TODO: Den här biten är samma som vid login. Ska det vara en funktion?
  //   const idToken = await userCredential.user.getIdToken();
  //
  //   if (idToken) {
  //     context.cookies.set(ACCESS_TOKEN_CONST, idToken, { httpOnly: true });
  //   } else {
  //     errorLogger.error({ message: `Något gick fen vid inloggning. UserCredential: ${userCredential}` });
  //   }
  // } catch (e) {
  //   handleFireBaseError(e, email);
  // }

  context.response.body = "";
});

userRoutes.post(`/login`, async (context) => {
  const { password, email } = await validateBodyUser(context);

  // const jwtToken = await context.cookies.get("jwt");
  //
  // if (jwtToken === undefined) {
  //   throw new httpErrors.Unauthorized("Ingen jwt token hittades");
  // }
  //
  // const jwtVerified = await verifyJwt(jwtToken);
  //
  // if (jwtVerified === null) {
  //   throw new httpErrors.Unauthorized("Ogiltig jwt token");
  // }

  // const user = await getUserByUsername(username);

  // if (user.error) {
  //   throw new httpErrors.Unauthorized("Kunde inte hämta användare");
  // }
  //
  // if (user.result?.length === 0) {
  //   throw new httpErrors.BadRequest("Email finns inte registered");
  // }

  // try {
  //   const auth = getAuth(fbApp);
  //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //   const idToken = await userCredential.user.getIdToken();
  //
  //   if (idToken) {
  //     // context.cookies.set(ACCESS_TOKEN_CONST, idToken, { httpOnly: true });
  //     context.cookies.set(ACCESS_TOKEN_CONST, idToken, { httpOnly: true });
  //   } else {
  //     errorLogger.error({ message: "Något gick fen vid inloggning. UserCredential: " + userCredential });
  //   }
  // } catch (e) {
  //   handleFireBaseError(e);
  // }

  // const passwordMatches = comparePasswords(password, user.result?.[0].password ?? "");
  // if (!passwordMatches) {
  //   throw new httpErrors.BadRequest("Ogiltigt användarnamn eller lösenord");
  // }

  context.response.body = "";
});

// TODO: Här gäller det att kolla att rätt användare är inloggad
userRoutes.delete(`/delete/:id`, async (context) => {
  if (!context?.params?.id || !validate(context?.params?.id)) {
    throw new httpErrors.UnprocessableEntity("Ogiltigt id för att radera användare");
  }

  // // TODO: Det är nog bättre om det här en middleware. Annars behöver man göra detta i varje endpoint
  // const jwtToken = await context.cookies.get("jwt");
  //
  // if (jwtToken === undefined) {
  //   throw new httpErrors.Unauthorized("Ingen jwt token hittades");
  // }
  //
  // const jwtVerified = await verifyJwt(jwtToken);
  //
  // if (jwtVerified === null) {
  //   throw new httpErrors.Unauthorized("Ogiltig jwt token");
  // }

  const user = await getUserById(context.params.id);

  if (user.result?.length === 0) {
    throw new httpErrors.BadRequest(`Kunde inte hitta användare med id: ${context.params.id}`);
  }

  const deletedUser = await deleteUserById(context.params.id);

  if (deletedUser.error) {
    throw new httpErrors.InternalServerError("Kunde inte radera användare");
  }

  context.response.body = {};
});

// TODO: Här gäller det att kolla att rätt användare är inloggad
userRoutes.post(`/reset-password`, async (context) => {
  await validateBody(context);

  const { email }: { email?: string } = await context.request.body.json();

  if (email === undefined) {
    throw new httpErrors.UnprocessableEntity("Email behöver finnas i body");
  }

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

  context.response.body = "";
});

userRoutes.post(`logout`, async (context) => {
  if (await context.cookies.get(ACCESS_TOKEN_CONST)) {
    context.cookies.delete(ACCESS_TOKEN_CONST);
  } else {
    errorLogger.error({ message: `Kunde inte hitta ${ACCESS_TOKEN_CONST}` });
  }

  context.response.body = "";
});

// TODO: Skapa endpoint för att logga ut, glömt lösenord, uppdatera lösenord
function hashPassword(password: string): string {
  try {
    // Skapa slumpmässig 16 bytes salt, rekommenderat av Node.js Docs
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

function handleFireBaseError(e: unknown, value?: unknown) {
  if (e instanceof FirebaseError) {
    switch (e.code) {
      case "auth/email-already-in-use":
        throw new httpErrors.BadRequest(`Email ${value} används redan. dbError: ${e}`);

      case "auth/user-not-found":
        throw new httpErrors.BadRequest(`Kunde inte hitta användare med email: ${value}. dbError: ${e}`);

      case "auth/invalid-credential":
        throw new httpErrors.BadRequest(`Fel lösenord`);

      case "auth/invalid-email":
        throw new httpErrors.BadRequest(`Ogiltig lösenord`);

      default:
        throw new httpErrors.InternalServerError(`Något gick fel i Firebase. dbError: ${e}`);
    }
  }

  throw new httpErrors.InternalServerError(`Något gick fel i Firebase. dbError: ${e}`);
}

async function createJwt(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(secret);

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
    throw new httpErrors.UnprocessableEntity("username, email och password behöver finnas i body");
  }

  return { email, password };
}

export default userRoutes;
