// @deno-types="npm:@types/nodemailer"^6.4.16"
import { createTransport } from "npm:nodemailer@^6.9.15";
import "jsr:@std/dotenv/load";

const emailConfig = {
  user: Deno.env.get("EMAIL"),
  pass: Deno.env.get("PASSWORD"),
  emailTo: Deno.env.get("EMAILTO"),
};

const transporter = createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

export async function sendWatchNotification(emailText: string) {
  if (Deno.env.get("NODE_ENV") === "develop") {
    return;
  }

  await transporter.sendMail({
    from: Deno.env.get("EMAIL"),
    to: Deno.env.get("EMAILTO"),
    subject: "Ny klocka tillgänglig! ⌚",
    text: emailText,
  });
}

export async function sendErrorNotification(err: unknown) {
  if (Deno.env.get("NODE_ENV") === "develop") {
    return;
  }

  await transporter.sendMail({
    from: emailConfig.user,
    to: emailConfig.emailTo,
    subject: "KS Web Scraper: Ett fel inträffade!",
    text: `Error message:\n\n${err}`,
  });
}
