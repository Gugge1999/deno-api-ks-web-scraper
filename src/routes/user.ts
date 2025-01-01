import { httpErrors } from "@oak/oak";
import { Router } from "@oak/oak/router";
// TODO: Försök att använda något annat bibliotek för bcrypt. Den kräver att node_modules finns och att nodeModulesDir behöver finnas i deno.json
// @deno-types="npm:@types/bcrypt@^5.0.2"
import { genSalt, hash as bcryptHash } from "bcrypt";
import { JWTPayload, SignJWT } from "jose";
import { Buffer } from "node:buffer";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { getUserByEmail, insertNewUser } from "../database/user.ts";
import { validateBody } from "./bevakningar.ts";

const keyLength = 32;

export const hash = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // generate random 16 bytes long salt - recommended by NodeJS Docs
    const salt = randomBytes(16).toString("hex");

    scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      // derivedKey is of type Buffer
      resolve(`${salt}.${derivedKey.toString("hex")}`);
    });
  });
};

export const compare = async (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const [salt, hashKey] = hash.split(".");
    // we need to pass buffer values to timingSafeEqual
    const hashKeyBuff = Buffer.from(hashKey, "hex");
    scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      // compare the new supplied password with the hashed password using timeSafeEqual
      resolve(timingSafeEqual(hashKeyBuff, derivedKey));
    });
  });
};

const secret = new TextEncoder().encode("secret-that-no-one-knows");

const userRoutes = new Router({
  prefix: "/api/user",
});

userRoutes.post(`/register`, async (context) => {
  const { email, password } = await validateBodyUser(context);

  if (password.length < 5) {
    throw new httpErrors.BadRequest("Lösenordet måste vara minst 5 tecken långt");
  }

  const hashedPassword = await generateHashedPassword(password);
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
  const token = await createJWT({ userId: 123, username: "john_doe" });

  context.response.body = {
    user: newUser.result?.[0],
  };
});

userRoutes.post(`/login`, async (context) => {
  const { email, password } = await validateBodyUser(context);

  const user = await getUserByEmail(email);

  if (user.error) {
    throw new httpErrors.Unauthorized("Kunde inte hämta användare");
  }

  if (user.result?.length === 0) {
    throw new httpErrors.BadRequest("Email finns inte registered");
  }

  const passwordMatches = await validatePassword(password, user.result?.[0].password ?? "");

  if (!passwordMatches) {
    throw new httpErrors.BadRequest("Ogiltigt användarnamn eller lösenord");
  }

  context.response.body = true;
});

async function generateHashedPassword(pwd: string) {
  const salt = await genSalt(10);
  const hashedPass = await bcryptHash(pwd, salt);

  return hashedPass;
}

async function validatePassword(pwd: string, storedPassword: string) {
  return await compare(pwd, storedPassword);
}

async function createJWT(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return jwt;
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
