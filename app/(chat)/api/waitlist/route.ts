import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));

  if (!email || typeof email !== "string") {
    return Response.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (apiKey && fromEmail) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [fromEmail],
        subject: "New waitlist signup",
        text: `New signup: ${email}`,
      }),
    }).catch(() => {});
  }

  return Response.json({ ok: true });
}
