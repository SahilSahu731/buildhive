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
export const sendEmail = async (to, subject, html) => {
    if (!hasValidCredentials())
        return;
    try {
        await transporter.sendMail({
            from: `"buildershub" <${process.env.EMAIL_USER?.replace(/"/g, '')}>`,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
};
