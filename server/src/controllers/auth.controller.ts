
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils/generateOTP.js';
import { sendEmail, sendWelcomeEmail } from '../services/email.service.js';
import { getOTPTemplate } from '../utils/emailTemplates.js';

import prisma from '../lib/prisma.js';

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      res.status(400).json({ message: "Email and type are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (type === "signup" && existingUser) {
      res.status(400).json({ message: "User already exists. Please login." });
      return;
    }

    if (type === "login" && !existingUser) {
      res.status(404).json({ message: "User not found. Please signup." });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP
    await prisma.otp.upsert({
      where: { email },
      update: { code: otp, expiresAt },
      create: { email, code: otp, expiresAt },
    });

    const html = getOTPTemplate(otp);
    await sendEmail(email, "Your Verification Code", html);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, type, name } = req.body;

    if (!email || !otp || !type) {
      res.status(400).json({ message: "Email, OTP, and type are required" });
      return;
    }

    const otpRecord = await prisma.otp.findUnique({ where: { email } });

    if (!otpRecord) {
      res.status(400).json({ message: "OTP not found. Request a new one." });
      return;
    }

    if (otpRecord.code !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (new Date() > otpRecord.expiresAt) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    // OTP verified
    let user;

    if (type === "signup") {
      if (!name) {
        res.status(400).json({ message: "Name is required for signup" });
        return;
      }
      
      // Create user
      user = await prisma.user.create({
        data: {
          email,
          name,
          emailVerified: true,
        },
      });

      // Send Welcome Email
      await sendWelcomeEmail(email, name);
    } else {
      // Login
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
         res.status(404).json({ message: "User not found" });
         return
      }
    }

    // Delete OTP after successful use
    await prisma.otp.delete({ where: { email } });

    // Generate user token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Authentication successful", token, user });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
