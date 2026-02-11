import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const hasValidCredentials = () => {
  return process.env.EMAIL_USER && 
         process.env.EMAIL_PASS && 
         !process.env.EMAIL_USER.includes('your-email');
};

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER?.replace(/"/g, ''),
    pass: process.env.EMAIL_PASS?.replace(/"/g, ''),
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!hasValidCredentials()) {
    console.warn("Email credentials missing. Skipping email.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"buildershub" <${process.env.EMAIL_USER?.replace(/"/g, '')}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

import { getWelcomeTemplate } from '../utils/emailTemplates.js';

export const sendWelcomeEmail = async (to: string, name: string) => {
    const html = getWelcomeTemplate(name);
    await sendEmail(to, "Welcome to buildershub! 🚀", html);
};
