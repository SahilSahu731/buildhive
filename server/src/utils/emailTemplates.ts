
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: #000000; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 40px 30px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #000000; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>buildershub</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} buildershub. All rights reserved.<br>
      Is this email not relevant? <a href="#" style="color:#666; text-decoration:underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
`;

export const getWelcomeTemplate = (name: string) => baseTemplate(`
  <h2>Welcome to the community, ${name}! 🚀</h2>
  <p>We're thrilled to have you on board. buildershub is where your best work begins.</p>
  <center>
    <a href="${process.env.FRONTEND_URL}" class="btn" style="color:#fff;">Get Started</a>
  </center>
`);

export const getOTPTemplate = (otp: string) => baseTemplate(`
  <h2>Your Verification Code</h2>
  <p>Please use the following code to verify your account. It expires in 10 minutes.</p>
  <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #000;">
    ${otp}
  </div>
  <p>If you didn't request this code, you can safely ignore this email.</p>
`);
