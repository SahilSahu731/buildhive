export const getOTPTemplate = (otp) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; font-size: 24px; margin: 10px 0;">buildershub</h1>
        <p style="color: #666; font-size: 16px;">Secure Login Verification</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <p style="color: #555; margin-bottom: 15px;">Your authentication code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${otp}</div>
        <p style="color: #888; font-size: 12px; margin-top: 15px;">This code expires in 10 minutes.</p>
      </div>
      
      <p style="color: #555; line-height: 1.5;">
        If you didn't request this code, you can safely ignore this email. Do not share this code with anyone.
      </p>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        &copy; ${new Date().getFullYear()} buildershub. All rights reserved.
      </div>
    </div>
  `;
};
