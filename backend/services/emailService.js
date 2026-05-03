const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendActivationEmail = async ({ to, fullName, activationToken }) => {
  const activationUrl = `${process.env.CLIENT_URL}/activate?token=${activationToken}`;

  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e40af; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">Welcome to the Team!</h1>
            </div>
            <div style="padding: 30px; color: #333;">
                <p>Hi <strong>${fullName}</strong>,</p>
                <p>Your employee account has been created. Please activate your account by clicking the button below:</p>
                <a href="${activationUrl}" 
                   style="display: inline-block; padding: 14px 28px; background: #1e40af; 
                   color: #ffffff; text-decoration: none; border-radius: 6px; 
                   font-weight: bold; margin: 20px 0;">
                Activate My Account
                </a>
                <p>This link is valid for <strong>24 hours</strong>.</p>
                <p>If the button does not work, copy and paste this link:</p>
                <p style="color: #1e40af;">${activationUrl}</p>
       
       
            </div>
        </div>
    `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Activate Your Employee Account",
    html,
  });
};

module.exports = { sendActivationEmail };
