import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const body = (await request.json()) as { to?: string };
  const to = String(body.to ?? "").trim();

  const emailServer = process.env.EMAIL_SERVER
    ? process.env.EMAIL_SERVER.replace(/^"|"$/g, "")
    : "";
  const emailFrom = process.env.EMAIL_FROM
    ? process.env.EMAIL_FROM.replace(/^"|"$/g, "")
    : "";

  if (!emailServer || !emailFrom) {
    return NextResponse.json(
      { ok: false, message: "EMAIL_SERVER / EMAIL_FROM manquants." },
      { status: 400 },
    );
  }

  if (!to) {
    return NextResponse.json(
      { ok: false, message: "Email destinataire requis." },
      { status: 400 },
    );
  }

  const transporter = nodemailer.createTransport({ url: emailServer });

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: "Test SMTP - Trophée FG",
      text: "Ceci est un email de test SMTP.",
    });

    return NextResponse.json({
      ok: true,
      message: "Email envoyé.",
      response: info.response,
      messageId: info.messageId,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Erreur SMTP.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
