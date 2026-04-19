import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendReminderEmail = async (to: string, userName: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Daily Habit Reminder',
    html: `
      <h1>Hi ${userName},</h1>
      <p>This is your daily reminder to check in on your habits!</p>
      <p>Click the link below to mark your progress for today:</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      <p>Stay consistent!</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendWarningEmail = async (to: string, userName: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Action Needed: Your habits are waiting!',
    html: `
      <h1>Hi ${userName},</h1>
      <p>It's been 12 hours since your reminder, and some of your habits are still not marked as complete.</p>
      <p>Don't break your streak! Quick check-in here:</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Check-in Now</a>
    `,
  };

  return transporter.sendMail(mailOptions);
};
