const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });  // Shared root .env with Next.js

const { subscribeSchema, formatIssues } = require("./validation");

const app = express();
const PORT = process.env.PORT || 5000;

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:3001";
const ALLOWED_ORIGINS = CLIENT_ORIGIN.split(",").map((origin) => origin.trim());

// Only our frontend may call this API
app.use(cors({ origin: ALLOWED_ORIGINS }));

// Logs requests' status
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    console.log(
      `[${req.method}] ${req.originalUrl} -> ${res.statusCode} ${res.statusMessage} (${Date.now() - startedAt}ms)`
    );
  });

  next();
});

app.use(express.json({ limit: "10kb" }));

// Unparseable JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }

  next(err);
});

// Gmail app password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "DEV@Deakin subscribe API is running." });
});

app.post("/subscribe", async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body);  // Validate before touching the email API

  if (!parsed.success) {
    const fields = formatIssues(parsed.error);
    console.warn("Rejected subscribe request:", fields);

    return res.status(400).json({
      error: fields.email || "Please check the details you entered.",
      fields,
    });
  }

  const { email } = parsed.data;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to DEV@Deakin!",
    text: "Thanks for subscribing! You'll now receive our daily insider.",
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    // Gmail's SMTP acknowledgement
    console.log("Email API response:", info.response);
    console.log("Accepted recipients:", info.accepted);
    console.log("Message ID:", info.messageId);

    return res.status(200).json({
      message: `Welcome email sent to ${email}. Check your inbox!`,
    });
  } catch (error) {
    console.error("Error sending email:", error);

    return res.status(502).json({  // The provider failed
      error: "We couldn't send the welcome email right now. Please try again.",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use((err, req, res, next) => {  // Catch anything not already handled
  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  console.log("Accepting requests from " + ALLOWED_ORIGINS.join(", "));
});
