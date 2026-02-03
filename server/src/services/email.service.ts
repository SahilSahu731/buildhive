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

import { getWelcomeTemplate, getPremiumTemplate, getLimitExhaustedTemplate, getInterestTemplate } from '../utils/emailTemplates.js';

export const sendWelcomeEmail = async (to: string, name: string) => {
    const html = getWelcomeTemplate(name);
    await sendEmail(to, "Welcome to buildershub! 🚀", html);
};

export const sendPremiumEmail = async (to: string, plan: string) => {
    const html = getPremiumTemplate(plan);
    await sendEmail(to, `You are now a ${plan} member! 🌟`, html);
};

export const sendLimitExhaustedEmail = async (to: string, plan: string, limit: number) => {
    const html = getLimitExhaustedTemplate(plan, limit);
    await sendEmail(to, "Hourly Limit Reached ⚠️", html);
};

export const sendInterestEmail = async (to: string, requesterName: string, projectTitle: string, message: string, projectId: string) => {
    const html = getInterestTemplate(requesterName, projectTitle, message, projectId);
    await sendEmail(to, `New Interest in "${projectTitle}" 🔔`, html);
};

