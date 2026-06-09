import nodemailer from "nodemailer";

function createTransport() {
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    // Log-only transport in development when SMTP isn't configured
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface ContactEmailOptions {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail(opts: ContactEmailOptions): Promise<void> {
  const transport = createTransport();
  const to = process.env.CONTACT_MAIL_TO ?? "contact@alexandrastefana.studio";
  const fromName = process.env.MAIL_FROM_NAME ?? "Alexandra Stefana Studio";

  const info = await transport.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER ?? "noreply@alexandrastefana.studio"}>`,
    replyTo: `"${opts.name}" <${opts.email}>`,
    to,
    subject: `Mesaj nou de la ${opts.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0b09;color:#e8d5b7;padding:32px;border-radius:8px">
        <h2 style="color:#c9a96e;margin-bottom:24px">Mesaj nou prin formular de contact</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#795c42;width:80px">Nume:</td>
            <td style="padding:8px 0">${opts.name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#795c42">Email:</td>
            <td style="padding:8px 0"><a href="mailto:${opts.email}" style="color:#c9a96e">${opts.email}</a></td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid rgba(201,169,110,0.2);margin:24px 0" />
        <p style="white-space:pre-wrap;line-height:1.6">${opts.message}</p>
      </div>
    `,
    text: `Nume: ${opts.name}\nEmail: ${opts.email}\n\n${opts.message}`,
  });

  if (process.env.NODE_ENV === "development" && "message" in info) {
    console.log("[Email] Contact form (dev log):", JSON.parse(String(info.message)));
  }
}
