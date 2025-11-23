import nodemailer from "nodemailer";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4242";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

type EmailParams = {
  user: { email: string };
  url: string;
  token: string;
};

export const sendVerificationEmail = async ({ user, url }: EmailParams) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1>Hi there!</h1>
        <p>Thank you for signing up. Please verify your email address.</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });

  console.log(`✉️ Verification email sent to ${user.email}`);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log(`👀 Preview (Ethereal): ${previewUrl}`);
};

export const sendResetPasswordEmail = async ({ user, token }: EmailParams) => {
  const resetLink = `${frontendUrl}/auth/reset?token=${token}`;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1>Password Recovery</h1>
        <p>You have requested to reset your password. Click the button below to continue:</p>
        
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          If you didn't request this, you can ignore this message. Your password will not change.
        </p>
      </div>
    `,
  });
  
  console.log(`🔑 Reset password email sent to ${user.email}`);
  console.log(`🔗 Frontend Link: ${resetLink}`);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log(`👀 Preview (Ethereal): ${previewUrl}`);
};

export const sendDeleteAccountEmail = async ({ user, url }: EmailParams) => {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "⚠️ Confirm account deletion",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fca5a5; border-radius: 8px;">
          <h1 style="color: #ef4444;">Delete Account</h1>
          <p>You have requested to permanently delete your account. This action <strong>CANNOT be undone</strong>.</p>
          <p>If you are sure, click the button below to confirm:</p>
          
          <a href="${url}" style="padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px;">
            Yes, delete my account
          </a>
          
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            If this wasn't you, change your password immediately.
          </p>
        </div>
      `,
    });
    
    console.log(`🗑️ Deletion email sent to ${user.email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`👀 Preview (Ethereal): ${previewUrl}`);
  };