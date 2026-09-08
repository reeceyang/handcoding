import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { env } from "./_generated/server";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes as any);
      },
    };

    const alphabet = "0123456789";
    const length = 8;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "renee, from coding by hand event! <renee@handcoding.bleebo.dev>",
      to: [email],
      subject: `your otp code ₊✩‧₊˚౨ৎ♡`,
      text: token,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
