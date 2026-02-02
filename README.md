# buildershub
> **The ultimate platform for developers to collaborate on projects, get AI-powered code reviews, and showcase their portfolio.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Features

- **AI Code Review**: Get instant, automated code analysis and vulnerability detection using Google Gemini AI.
- **Project Collaboration**: Create projects, invite team members, and build software together seamlessly.
- **Developer Portfolio**: Showcase your best work, skills, and contributions with a dedicated professional profile.
- **Secure Authentication**: Robust login support via GitHub, Google, and Email (powered by Passport.js & JWT).
- **Pro Memberships**: Integrated subscription handling via Razorpay for premium features.
- **Modern UI/UX**: Built with Next.js 15, TailwindCSS, and Shadcn UI for a responsive and accessible experience.
- **Analytics**: Integrated Google Analytics for tracking user engagement.

## Tech Stack

### Frontend (`/client`)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, Shadcn UI, Lucas Lucide Icons
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **AI Engine**: Google Gemini API
- **File Storage**: Cloudinary
- **Authentication**: Passport.js (OAuth2 + Local)

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL Database (Local or Supabase)
- Cloudinary Account
- Google Gemini API Key
- GitHub/Google OAuth Credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SahilSahu731/buildhive.git
   cd buildhive
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Create a .env file based on your configuration
   # Ensure DATABASE_URL, GEMINI_API_KEY, and OAuth keys are set
   
   # Run Database Migrations
   npx prisma generate
   npx prisma db push
   
   # Start Server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   
   # Create .env.local file
   # Set NEXT_PUBLIC_API_URL=http://localhost:5000
   
   # Start Client
   npm run dev
   ```

4. **Visit the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```bash
buildhive/
├── client/              # Next.js Frontend Application
│   ├── src/app/         # App Router Pages & Layouts
│   ├── src/components/  # Reusable UI Components
│   └── src/lib/         # API Hooks & Utilities
├── server/              # Express Backend API
│   ├── src/controllers/ # Request Logic
│   ├── src/routes/      # API Endpoint Definitions
│   ├── src/prisma/      # Database Schema
│   └── src/services/    # AI & Email Services
└── DEPLOYMENT_GUIDE.md  # PRODUCTION DEPLOYMENT INSTRUCTIONS
```

## Deployment

For detailed deployment instructions (Vercel + Render), please refer to the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) file included in this repository.

## Contributing

Contributions are always welcome!
1. Fork the repository.
2. Create `your-feature` branch.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin your-feature`.
5. Open a Pull Request.

## License

This project is open sourced under the **MIT License**.

---
**buildershub** — Built by [Sahil Sahu](https://github.com/SahilSahu731)
