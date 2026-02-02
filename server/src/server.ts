import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

import session from 'express-session';
import passport from './config/passport.js';

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
import interestRoutes from "./routes/interest.routes.js";
import userRoutes from "./routes/user.routes.js";
import codeReviewRoutes from "./routes/code-review.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/code-reviews", codeReviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/announcements", announcementRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
