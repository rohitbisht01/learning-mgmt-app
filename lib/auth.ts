import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
        await resend.emails.send({
          from: "LearnForge <onboarding@resend.dev>",
          to: [email],
          subject: "Verify your email",
          html: `<p>Your OTP is <strong>${otp}</strong> </p>`,
        });
      },
    }),
  ],
});
