const nodemailer = require("nodemailer");

exports.handler = async (event) => {
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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: "💕 Yeni Anonymous Crush Mesajı",
      html: `
        <div style="font-family: Arial; padding:20px">
          <h2>Yeni Crush Mesajı</h2>
          <p><b>Kullanıcı:</b> @${username}</p>
          <p><b>Mesaj:</b></p>
          <p>${message || "Mesaj yok"}</p>
        </div>
      `,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("MAIL ERROR:", error);
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
