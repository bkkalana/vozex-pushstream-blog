import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/logger";

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${env.SITE_URL}/admin/reset-password?token=${encodeURIComponent(token)}`;
  const smtpReady = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM);

  if (!smtpReady) {
    if (env.NODE_ENV !== "production") logger.info("Development password reset URL", { email, resetUrl });
    else logger.error("Password reset email not sent because SMTP is not configured.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Reset your PushStream admin password",
    text: `A password reset was requested for your PushStream admin account. Open this link within ${env.PASSWORD_RESET_TTL_MINUTES} minutes: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
  });
}
