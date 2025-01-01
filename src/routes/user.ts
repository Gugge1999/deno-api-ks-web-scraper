import { Router } from "@oak/oak/router";
import { validateBody } from "./bevakningar.ts";
import { httpErrors } from "@oak/oak";
// TODO: Försök att använda något annat bibliotek för bcrypt. Den kräver att node_modules finns och att nodeModulesDir behöver finnas i deno.json
// @deno-types="npm:@types/bcrypt@^5.0.2"
import { compare, genSalt, hash } from "bcrypt";
import { insertNewUser } from "../database/user.ts";

const userRoutes = new Router({
  prefix: "/api/user",
});

userRoutes.post(`/register`, async (context) => {
  await validateBody(context);

  const { email, password }: {
    email?: string;
    password?: string;
  } = await context.request.body.json();

  if (email === undefined || password === undefined) {
    throw new httpErrors.UnprocessableEntity("email och password behöver finnas i body");
  }

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

  context.response.body = newUser.result?.[0];
});

async function generateHashedPassword(pwd: string) {
  const saltRounds = 10;
  const salt = await genSalt(saltRounds);
  const hashedPass = await hash(pwd, salt);
  return hashedPass;
}

async function validatePassword(pwd: string, storedPassword: string) {
  return await compare(pwd, storedPassword);
}

export default userRoutes;
