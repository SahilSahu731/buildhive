
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
    .alert { background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 15px; margin: 20px 0; border-radius: 4px; color: #9f1239; }
    .info { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; color: #1e40af; }
    .project-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 20px; background: #f8fafc; }
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
  <p>Here's what you can do next:</p>
  <ul>
    <li>🔍 <strong>Analyze Code:</strong> Try our AI code reviewer.</li>
    <li>🤝 <strong>Collaborate:</strong> Find a project to join.</li>
    <li>💼 <strong>Build Portfolio:</strong> Showcase your skills.</li>
  </ul>
  <center>
    <a href="${process.env.FRONTEND_URL}/dashboard" class="btn" style="color:#fff;">Go to Dashboard</a>
  </center>
`);

export const getPremiumTemplate = (plan: string) => baseTemplate(`
  <h2>You're officially a ${plan} member! 🌟</h2>
  <p>Thank you for upgrading your account. You've just unlocked serious power.</p>
  
  <div class="info">
    <strong>What's new:</strong>
    <ul style="margin-top:10px; padding-left:20px;">
      <li>Increased AI Code Reviews</li>
      <li>Priority support</li>
      <li>Profile badges</li>
    </ul>
  </div>
  
  <p>Go ahead and test your new limits!</p>
  <center>
    <a href="${process.env.FRONTEND_URL}/code-review" class="btn" style="color:#fff;">Try AI Review</a>
  </center>
`);

// Renamed from getOTPTemplate to avoid conflict if I'm replacing the old file content, 
// or I can just export all. The file 'emailTemplates.js' exists in utils.
// I should verify if I am replacing or appending. I will REPLACE it fully and re-add getOTPTemplate.

export const getOTPTemplate = (otp: string) => baseTemplate(`
  <h2>Your Verification Code</h2>
  <p>Please use the following code to verify your account. It expires in 10 minutes.</p>
  <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #000;">
    ${otp}
  </div>
  <p>If you didn't request this code, you can safely ignore this email.</p>
`);

export const getLimitExhaustedTemplate = (plan: string, limit: number) => baseTemplate(`
  <h2>⚠️ Daily Limit Reached</h2>
  <p>You've hit your daily limit of <strong>${limit} code reviews</strong> for the <strong>${plan}</strong> plan.</p>
  
  <div class="alert">
    <strong>Need more?</strong><br>
    Your limit resets at midnight, or you can upgrade to get more bandwidth immediately.
  </div>
  
  <center>
    <a href="${process.env.FRONTEND_URL}/pricing" class="btn" style="color:#fff;">Upgrade Plan</a>
  </center>
`);

export const getInterestTemplate = (requesterName: string, projectTitle: string, message: string, projectId: string) => baseTemplate(`
  <h2>🔔 New Interest in Your Project!</h2>
  <p><strong>${requesterName}</strong> wants to join your project: <strong>"${projectTitle}"</strong>.</p>
  
  <div class="project-card">
    <strong>Message from ${requesterName}:</strong>
    <p style="font-style: italic; color: #555;">"${message}"</p>
  </div>
  
  <p>Visit your dashboard to view their profile and accept or reject the request.</p>
  <center>
    <a href="${process.env.FRONTEND_URL}/dashboard" class="btn" style="color:#fff;">View Request</a>
  </center>
`);
