import nodemailer from "nodemailer";

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendVerificationEmailParams {
  email: string;
  code: string;
  name?: string;
}

export async function sendVerificationEmail({
  email,
  code,
  name,
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  const greeting = name ? name : "there";

  // Always log the code for development
  console.log(`\n========================================`);
  console.log(`VERIFICATION CODE for ${email}: ${code}`);
  console.log(`========================================\n`);

  const mailOptions = {
    from: `"CashGap" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Your verification code - CashGap",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td style="padding: 48px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 400px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="padding: 32px;">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 32px;">
                <span style="font-size: 24px; font-weight: 700; color: #3b82f6;">CashGap</span>
              </div>
              
              <!-- Main Content -->
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #64748b; line-height: 1.6; text-align: center;">
                Hey ${greeting}, here's your verification code:
              </p>
              
              <!-- Code Display -->
              <div style="background-color: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px 16px; margin-bottom: 24px; text-align: center;">
                <span style="font-size: 36px; font-weight: 700; color: #1e293b; letter-spacing: 8px; font-family: 'SF Mono', Monaco, 'Courier New', monospace;">${code}</span>
              </div>
              
              <!-- Expiry -->
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; text-align: center;">
                This code expires in 15 minutes
              </p>
              
              <!-- Divider -->
              <div style="height: 1px; background-color: #e2e8f0; margin: 24px 0;"></div>
              
              <!-- Footer -->
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6; text-align: center;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
        </table>
        
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center;">
          © ${new Date().getFullYear()} CashGap. Take control of your finances.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hey ${greeting}!\n\nYour CashGap verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.\n\n© ${new Date().getFullYear()} CashGap`,
  };

  // Try to send email, but always return success so the flow continues
  // This allows development without SMTP configured
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log(`[Email] Verification email sent to ${email}`);
    } else {
      console.log(
        `[Email] SMTP not configured - check console for verification code`,
      );
    }
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    console.log(`[Email] Use the verification code from console: ${code}`);
  }

  // Always return success - the code is logged to console for dev use
  return { success: true };
}
