import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(to: string, otp: string, name: string) {
  const digits = otp.split("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#1e293b; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e293b; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="460" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,0.3);">
          
          <!-- Tricolor Top Bar (thick, vibrant) -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33.33%" style="height:6px; background-color:#FF9933;"></td>
                  <td width="33.33%" style="height:6px; background-color:#FFFFFF; border-top:3px solid #f1f5f9;"></td>
                  <td width="33.33%" style="height:6px; background-color:#138808;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Logo Section -->
          <tr>
            <td style="padding:36px 36px 20px 36px; text-align:center; background-color:#fefefe;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:52px; height:52px; border-radius:14px; text-align:center; vertical-align:middle; font-size:26px; font-weight:900; color:#1a237e; border:3px solid #e2e8f0;">
                    A
                  </td>
                  <td style="padding-left:14px; text-align:left;">
                    <span style="font-size:24px; font-weight:800; color:#1e293b; display:block; line-height:1.2;">All India</span>
                    <span style="font-size:24px; font-weight:800; display:block; line-height:1.2;">
                      <span style="color:#FF9933;">Train</span><span style="color:#138808;">ings</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thin Divider -->
          <tr>
            <td style="padding:0 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:1px; background-color:#e2e8f0;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:24px 36px 8px 36px; text-align:center;">
              <p style="font-size:16px; color:#64748b; margin:0;">Hello <strong style="color:#1e293b; font-size:17px;">${name}</strong> 👋</p>
            </td>
          </tr>

          <!-- OTP Section with colored background -->
          <tr>
            <td style="padding:16px 36px 20px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px; overflow:hidden; border:2px solid #FF9933;">
                <!-- Section header -->
                <tr>
                  <td style="background-color:#FFF7ED; padding:16px 20px 8px 20px; text-align:center;">
                    <p style="font-size:11px; color:#c2410c; margin:0; text-transform:uppercase; letter-spacing:3px; font-weight:800;">Your Verification Code</p>
                  </td>
                </tr>
                <!-- OTP Digits as individual boxes -->
                <tr>
                  <td style="background-color:#FFF7ED; padding:8px 20px 16px 20px; text-align:center;">
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        ${digits.map(d => `
                        <td style="padding:0 4px;">
                          <div style="width:48px; height:56px; background-color:#ffffff; border:2px solid #fdba74; border-radius:12px; text-align:center; line-height:56px; font-size:28px; font-weight:900; color:#1e293b; font-family:'Courier New',monospace;">
                            ${d}
                          </div>
                        </td>
                        `).join("")}
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Expiry -->
                <tr>
                  <td style="background-color:#FFF7ED; padding:4px 20px 16px 20px; text-align:center;">
                    <p style="font-size:12px; color:#92400e; margin:0;">⏱ Valid for <strong>10 minutes</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info Text -->
          <tr>
            <td style="padding:4px 36px 28px 36px; text-align:center;">
              <p style="font-size:13px; color:#94a3b8; margin:0; line-height:1.7;">
                Enter this code on the verification page to complete your registration. 
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Tricolor Divider -->
          <tr>
            <td style="padding:0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33.33%" style="height:3px; background-color:#FF9933;"></td>
                  <td width="33.33%" style="height:3px; background-color:#0000AA;"></td>
                  <td width="33.33%" style="height:3px; background-color:#138808;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with dark bg -->
          <tr>
            <td style="padding:20px 36px 24px 36px; text-align:center; background-color:#f8fafc;">
              <p style="font-size:12px; color:#64748b; margin:0 0 4px 0; font-weight:600;">
                All India Trainings
              </p>
              <p style="font-size:11px; color:#94a3b8; margin:0 0 2px 0;">
                Connecting Trainers & Vendors Nationwide 🇮🇳
              </p>
              <p style="font-size:10px; color:#cbd5e1; margin:0;">
                © 2026 All India Trainings. All rights reserved.
              </p>
            </td>
          </tr>

          <!-- Tricolor Bottom Bar -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33.33%" style="height:6px; background-color:#FF9933;"></td>
                  <td width="33.33%" style="height:6px; background-color:#FFFFFF; border-bottom:3px solid #f1f5f9;"></td>
                  <td width="33.33%" style="height:6px; background-color:#138808;"></td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Sub-footer outside card -->
        <table width="460" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0; text-align:center;">
              <p style="font-size:10px; color:#64748b; margin:0;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"All India Trainings" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${otp} — Your All India Trainings Verification Code`,
      html,
    });
  } catch (error) {
    console.warn("Primary email transporter failed, trying fallback transporter (support@orcadehub.com):", error);
    const fallbackTransporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: 'support@orcadehub.com',
        pass: 'LU7gEMDB8gnQ',
      },
    });

    await fallbackTransporter.sendMail({
      from: `"All India Trainings" <support@orcadehub.com>`,
      to,
      subject: `${otp} — Your All India Trainings Verification Code`,
      html,
    });
  }
}
