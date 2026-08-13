import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey.trim());
  }
  return resendInstance;
}

interface SendOtpEmailParams {
  toEmail: string;
  recipientName: string;
  otpCode: string;
  role: 'super_admin' | 'customer';
}

export async function sendOtpEmail({
  toEmail,
  recipientName,
  otpCode,
  role
}: SendOtpEmailParams): Promise<{ success: boolean; resendId?: string; error?: string; simulated?: boolean }> {
  const resend = getResend();
  const year = new Date().getFullYear();
  const isSuperAdmin = role === 'super_admin';

  const subject = isSuperAdmin
    ? `[Super Admin] Your Alham Security Verification Code: ${otpCode}`
    : `Your Alham Verification Code: ${otpCode}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F2E8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #29231F;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F7F2E8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E8DCC8; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); max-width: 520px;">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #29231F; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: 300; letter-spacing: 6px; color: #F7F2E8; font-style: italic;">
                ALHAM
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #C8A96B; font-weight: 600;">
                Handcrafted Healthy Snacks • Dhaka
              </p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px; text-align: left;">
              ${
                isSuperAdmin
                  ? `<div style="background-color: #A8644515; border-left: 4px solid #A86445; padding: 10px 14px; margin-bottom: 20px; border-radius: 4px; font-size: 12px; color: #A86445; font-weight: 600;">
                       🛡️ Super Admin Security Login Request
                     </div>`
                  : ''
              }
              <h2 style="margin: 0 0 12px 0; font-family: Georgia, serif; font-size: 20px; font-weight: 400; color: #29231F;">
                Security Verification Code
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4A423D;">
                Hello <strong>${recipientName || 'Valued Guest'}</strong>,<br><br>
                Please enter the following 6-digit verification code to authenticate your login to <strong>Alham</strong>:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #F7F2E8; border: 2px dashed #C8A96B; border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #A86445; display: inline-block;">
                  ${otpCode}
                </span>
              </div>
              
              <div style="border-top: 1px solid #E8DCC8; padding-top: 16px; font-size: 12px; color: #77716A; line-height: 1.6;">
                <p style="margin: 0 0 6px 0;">⏱️ <strong>Expiration:</strong> Valid for 10 minutes from request.</p>
                <p style="margin: 0 0 6px 0;">🔒 <strong>Security Notice:</strong> Never share this code with anyone. Alham staff will never ask for your verification code.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F2E8; padding: 20px 28px; text-align: center; border-top: 1px solid #E8DCC8;">
              <p style="margin: 0; font-size: 11px; color: #888178; line-height: 1.5;">
                &copy; ${year} Alham Confectionery Dhaka. All rights reserved.<br>
                Freshly prepared with Saudi Medjool dates & pure single-origin ingredients.
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

  if (!resend) {
    console.log(`[RESEND SIMULATION] RESEND_API_KEY is not configured. Email OTP code for ${toEmail} (${role}): ${otpCode}`);
    return {
      success: true,
      simulated: true,
      error: `RESEND_API_KEY not configured. Verification code for ${toEmail} logged on server console: ${otpCode}`
    };
  }

  // Determine sender email
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (!toEmail || !toEmail.includes('@')) {
    console.error(`[RESEND ERROR] Invalid recipient email address: "${toEmail}"`);
    return { success: false, error: 'Invalid recipient email address.' };
  }

  try {
    console.log(`[RESEND ATTEMPT] Dispatching OTP email to ${toEmail} (Role: ${role}) via sender: ${fromAddress}`);
    const data = await resend.emails.send({
      from: fromAddress,
      to: toEmail,
      subject,
      html: htmlContent
    });

    if (data.error) {
      console.error(`[RESEND OTP DISPATCH FAILURE] Recipient: ${toEmail} | Error:`, JSON.stringify(data.error, null, 2));
      
      console.warn(`[RESEND DISPATCH NOTICE] Unable to deliver via Resend (${data.error.message}). Verification Code for ${toEmail} is: ${otpCode}`);
      return {
        success: true,
        simulated: true,
        resendId: `notice-${Date.now()}`,
        error: `Resend Notice (${data.error.message}): Code for ${toEmail} is ${otpCode}`
      };
    }

    // Check delivery status after short delay to verify if Resend accepted or failed asynchronously (e.g. daily quota exhausted or sandbox domain restriction)
    let asyncFailed = false;
    let failReason = '';
    if (data.data?.id) {
      try {
        await new Promise(r => setTimeout(r, 600));
        const check = await resend.emails.get(data.data.id);
        if (check.data?.last_event === 'failed') {
          asyncFailed = true;
          failReason = 'Resend daily quota limit reached or sandbox domain restriction.';
        }
      } catch (checkErr) {
        // Status check error ignored
      }
    }

    if (asyncFailed) {
      console.warn(`[RESEND ASYNC FAILURE DETECTED] Recipient: ${toEmail} | Message ID: ${data.data?.id} | Reason: ${failReason} | Generated Code for ${toEmail}: ${otpCode}`);
      return {
        success: true,
        simulated: true,
        resendId: data.data?.id,
        error: `Resend Delivery Notice (${failReason}): Code for ${toEmail} is ${otpCode}`
      };
    }

    console.log(`[RESEND SUCCESS] Sent OTP email to ${toEmail}. Resend Message ID: ${data.data?.id}`);
    return {
      success: true,
      resendId: data.data?.id
    };
  } catch (err: any) {
    console.error(`[RESEND EXCEPTION] Exception during Resend dispatch to ${toEmail}:`, err);
    console.warn(`[RESEND FALLBACK NOTICE] Exception occurred during email dispatch. OTP Code for ${toEmail} is: ${otpCode}`);
    return {
      success: true,
      simulated: true,
      error: `Resend Exception: Code for ${toEmail} is ${otpCode}`
    };
  }
}

export async function sendOrderNotificationEmail({
  toEmail,
  orderId,
  customerName,
  subject,
  message,
}: {
  toEmail: string;
  orderId: string;
  customerName: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  const resend = getResend();
  const year = new Date().getFullYear();
  
  const htmlContent = `<!DOCTYPE html><html><head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F2E8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #29231F;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
    <tr><td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E8DCC8; max-width: 520px; overflow: hidden;">
          <tr>
            <td style="background-color: #29231F; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; color: #F7F2E8;">ALHAM</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <p>Hello <strong>${customerName || 'Valued Guest'}</strong>,</p>
              <p>${message}</p>
              <p style="margin-top: 24px;">Order Reference: <strong>${orderId}</strong></p>
            </td>
          </tr>
        </table>
    </td></tr>
  </table>
</body></html>`;

  if (!resend) {
    console.log(`[RESEND SIMULATION] Email to ${toEmail}. Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (!toEmail || !toEmail.includes('@')) {
    return { success: false, error: 'Invalid recipient email address.' };
  }

  try {
    const data = await resend.emails.send({
      from: fromAddress,
      to: toEmail,
      subject,
      html: htmlContent
    });
    if (data.error) {
      if (data.error.name === 'validation_error') {
        console.warn(`[RESEND CONFIG WARNING] Validation error for order email (Subject: ${subject}). Check RESEND_FROM_EMAIL domain authorization in Resend dashboard.`, JSON.stringify(data.error, null, 2));
      } else {
        console.error(`[RESEND ERROR] Failed to send order email (Subject: ${subject}).`, JSON.stringify(data.error, null, 2));
      }
      return { 
        success: true, // Return success so the order process continues
        simulated: true,
        error: data.error.message 
      };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[RESEND EXCEPTION]', err);
    return { success: false, error: err.message };
  }
}
