import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { username, message } = JSON.parse(event.body || "{}");

    if (!username) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "username zorunlu" }),
      };
    }

    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: "💕 Yeni Anonymous Crush Mesajı",
      html: `
        <div style="font-family: Arial; padding:20px">
          <h2>Yeni Crush Mesajı 💌</h2>
          <p><b>Kullanıcı:</b> @${username}</p>
          <p><b>Mesaj:</b></p>
          <p>${message || "Mesaj yok"}</p>
          <hr />
          <small>hiddencrushbot.com</small>
        </div>
      `,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("RESEND ERROR:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Mail gönderilemedi",
        details: error.message,
      }),
    };
  }
};
