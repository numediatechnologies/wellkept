import { Resend } from "resend";
import { enforceBrandVoice } from "./domain";
import { serverEnv } from "./env";
import { safeInsert } from "./supabaseAdmin";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  body: string;
}) {
  const subject = enforceBrandVoice(input.subject, {
    audience: "public",
    format: "email",
  });
  const body = enforceBrandVoice(input.body, {
    audience: "public",
    format: "email",
  });

  if (!serverEnv.resendApiKey) {
    return {
      queued: false,
      provider: "resend",
      reason: "missing_resend_api_key",
      subject,
      body,
    };
  }

  const resend = new Resend(serverEnv.resendApiKey);
  const result = await resend.emails.send({
    from: `Well-Kept Alerts <${serverEnv.resendFromEmail}>`,
    to: [input.to],
    subject,
    text: body,
    html: `<div style="font-family: Georgia, serif; color: #1f2a1f; line-height: 1.6;"><p>${body.replace(/\n/g, "</p><p>")}</p></div>`,
  });

  await safeInsert("email_events", {
    recipient: input.to,
    subject,
    provider: "resend",
    status: result.error ? "failed" : "sent",
  });

  if (result.error) {
    return {
      queued: false,
      provider: "resend",
      reason: result.error.message,
      subject,
      body,
    };
  }

  return {
    queued: true,
    provider: "resend",
    id: result.data?.id,
    subject,
    body,
  };
}
