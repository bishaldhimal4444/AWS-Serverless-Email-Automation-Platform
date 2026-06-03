const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({
  region: process.env.AWS_REGION,
});

/* =========================
   Configuration
========================= */

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

/* =========================
   Helpers
========================= */

function response(statusCode, payload) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify(payload),
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function sanitizeHeaderValue(value) {
  return String(value).replace(/[\r\n]/g, "");
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function sendEmailWithTimeout(params, timeoutMs = 10000) {
  return Promise.race([
    ses.send(new SendEmailCommand(params)),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SES request timeout")), timeoutMs),
    ),
  ]);
}

/* =========================
   Lambda Handler
========================= */

exports.handler = async (event) => {
  const senderEmail = process.env.SENDER_EMAIL;
  const recipientEmail = process.env.RECIPIENT_EMAIL;

  if (!senderEmail || !recipientEmail) {
    console.error("Missing environment variables");

    return response(500, {
      success: false,
      message: "Server configuration error",
    });
  }

  /* =========================
       Method Validation
    ========================= */

  if (event.httpMethod !== "POST") {
    return response(405, {
      success: false,
      message: "Method not allowed",
    });
  }

  /* =========================
       Parse Request Body
    ========================= */

  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return response(400, {
      success: false,
      message: "Invalid JSON payload",
    });
  }

  const { name, email, message } = body;

  /* =========================
       Required Fields
    ========================= */

  if (!name || !email || !message) {
    return response(400, {
      success: false,
      message: "Name, email and message are required",
    });
  }

  /* =========================
       Length Validation
    ========================= */

  if (name.length > MAX_NAME_LENGTH) {
    return response(400, {
      success: false,
      message: `Name cannot exceed ${MAX_NAME_LENGTH} characters`,
    });
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return response(400, {
      success: false,
      message: `Email cannot exceed ${MAX_EMAIL_LENGTH} characters`,
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return response(400, {
      success: false,
      message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
    });
  }

  /* =========================
       Email Validation
    ========================= */

  if (!isValidEmail(email)) {
    return response(400, {
      success: false,
      message: "Invalid email address",
    });
  }

  /* =========================
       Safe Values
    ========================= */

  const safeName = sanitizeHeaderValue(name.trim());
  const safeEmail = email.trim();
  const safeMessage = message.trim();

  console.log("Contact form request received", {
    nameLength: safeName.length,
    emailProvided: true,
    messageLength: safeMessage.length,
    timestamp: new Date().toISOString(),
  });

  /* =========================
       Email Content
    ========================= */

  const timestamp = new Date().toISOString();

  const params = {
    Source: senderEmail,

    Destination: {
      ToAddresses: [recipientEmail],
    },

    ReplyToAddresses: [safeEmail],

    Message: {
      Subject: {
        Data: `Contact Form: Message from ${safeName}`,
      },

      Body: {
        Text: {
          Data: `
New Contact Form Submission

Name: ${safeName}
Email: ${safeEmail}
Received: ${timestamp}

Message:
${safeMessage}

---
Sent via AWS Lambda + Amazon SES
`,
        },

        Html: {
          Data: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
    font-family: Arial, sans-serif;
    color: #333;
    line-height: 1.6;
}
.container {
    max-width: 600px;
    margin: 0 auto;
}
.header {
    background: #4F46E5;
    color: white;
    padding: 20px;
}
.content {
    padding: 20px;
    border: 1px solid #ddd;
}
.label {
    font-weight: bold;
}
.message-box {
    background: #f8f9fa;
    padding: 15px;
    margin-top: 10px;
    border-left: 4px solid #4F46E5;
}
.footer {
    margin-top: 20px;
    font-size: 12px;
    color: #777;
}
</style>
</head>
<body>
<div class="container">

    <div class="header">
        <h2>New Contact Form Submission</h2>
    </div>

    <div class="content">

        <p>
            <span class="label">Name:</span>
            ${escapeHtml(safeName)}
        </p>

        <p>
            <span class="label">Email:</span>
            <a href="mailto:${escapeHtml(safeEmail)}">
                ${escapeHtml(safeEmail)}
            </a>
        </p>

        <p>
            <span class="label">Received:</span>
            ${new Date().toLocaleString()}
        </p>

        <div class="message-box">
            ${escapeHtml(safeMessage).replace(/\n/g, "<br>")}
        </div>

    </div>

    <div class="footer">
        Sent via AWS Lambda + Amazon SES
    </div>

</div>
</body>
</html>
`,
        },
      },
    },
  };

  try {
    const result = await sendEmailWithTimeout(params);

    console.log("Email sent successfully", {
      messageId: result.MessageId,
    });

    return response(200, {
      success: true,
      message: "Email sent successfully",
      messageId: result.MessageId,
    });
  } catch (error) {
    console.error("Email sending failed", {
      error: error.message,
    });

    return response(500, {
      success: false,
      message: "Failed to send email. Please try again later.",
    });
  }
};
