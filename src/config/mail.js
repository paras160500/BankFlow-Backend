// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────
//                            Registration Email
// ────────────────────────────────────────────────────────────────────────

async function sendRegisterEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger";

  const text = `Hello ${name},

Welcome to Backend Ledger! 🎉

Thank you for registering with us. We are excited to have you on board!

You can now start using your account and exploring the platform.

Best Regards,
The Backend Ledger Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px 16px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">

        <!-- Welcome Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="
            display: inline-block;
            width: 56px;
            height: 56px;
            line-height: 56px;
            border-radius: 50%;
            background-color: #dbeafe;
            color: #2563eb;
            font-size: 28px;
          ">
            👋
          </div>

          <h2 style="color: #2563eb; margin: 16px 0 4px;">
            Welcome to Backend Ledger!
          </h2>

          <p style="color: #64748b; margin: 0;">
            Your account has been created successfully.
          </p>
        </div>

        <p>Hello <strong>${name}</strong>,</p>

        <p>
          Thank you for registering with <strong>Backend Ledger</strong>.
          We are excited to have you on board!
        </p>

        <p>
          You can now start using your account and exploring the platform.
          We look forward to having you with us.
        </p>

        <!-- Welcome Message -->
        <div style="
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
          margin: 24px 0;
        ">
          <p style="
            margin: 0;
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
          ">
            🎉 <strong>You're all set!</strong><br />
            Your Backend Ledger account is ready to use.
          </p>
        </div>

        <p style="margin-top: 28px;">
          Best Regards,<br />
          <strong>The Backend Ledger Team</strong>
        </p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 28px 0;" />

        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this email.
        </p>

      </div>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

// ────────────────────────────────────────────────────────────────────────
//                            Transaction Complete
// ────────────────────────────────────────────────────────────────────────

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful - Backend Ledger";

  const text = `Hello ${name},

Your transaction was completed successfully! ✅

Amount Transferred: ₹${amount}
Transferred To: ${toAccount}

The amount has been successfully transferred from your Backend Ledger account.

Thank you for using Backend Ledger.

Best Regards,
The Backend Ledger Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px 16px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">

        <!-- Success Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="
            display: inline-block;
            width: 56px;
            height: 56px;
            line-height: 56px;
            border-radius: 50%;
            background-color: #dcfce7;
            color: #16a34a;
            font-size: 30px;
            font-weight: bold;
          ">
            ✓
          </div>

          <h2 style="color: #16a34a; margin: 16px 0 4px;">
            Transaction Successful!
          </h2>

          <p style="color: #64748b; margin: 0;">
            Your money has been transferred successfully.
          </p>
        </div>

        <p>Hello <strong>${name}</strong>,</p>

        <p>
          Your transaction has been completed successfully. Here are the
          details of your transfer:
        </p>

        <!-- Transaction Details -->
        <div style="
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
          margin: 24px 0;
        ">

          <div style="margin-bottom: 18px;">
            <p style="margin: 0 0 6px; font-size: 13px; color: #64748b;">
              Amount Transferred
            </p>
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #16a34a;">
              ₹${amount}
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <p style="margin: 0 0 6px; font-size: 13px; color: #64748b;">
              Transferred To
            </p>
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">
              ${toAccount}
            </p>
          </div>

        </div>

        <p>
          If you did not authorize this transaction, please contact the
          Backend Ledger support team immediately.
        </p>

        <p style="margin-top: 28px;">
          Best Regards,<br />
          <strong>The Backend Ledger Team</strong>
        </p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 28px 0;" />

        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this email.
        </p>

      </div>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegisterEmail,
  sendTransactionEmail,
};
