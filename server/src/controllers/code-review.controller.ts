import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { reviewCode } from '../services/ai.service.js';

// Supported languages
const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'go',
  'rust',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'swift',
  'kotlin',
];

// Review code (public, with rate limiting handled by middleware/caller context)
// Note: Actual public rate limiting usually done via middleware (express-rate-limit).
// Here we handle daily limits for authenticated users.
export const createCodeReview = async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;
    const userId = req.user?.userId; // Optional (if public access is allowed)

    // Validation
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    if (code.length > 20000) {
      return res.status(400).json({ error: 'Code too long (max 20,000 characters)' });
    }

    if (!SUPPORTED_LANGUAGES.includes(language.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Unsupported language',
        supported: SUPPORTED_LANGUAGES 
      });
    }

    // Check daily limit for users (e.g. 10/day for free)
    // Check daily limit for users
    if (userId) {
      const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { plan: true }
      });
      const plan = user?.plan || 'FREE';
      
      const limits = {
          FREE: 5,
          PREMIUM: 50,
          PRO: 1000
      };
      const limit = limits[plan as keyof typeof limits] || 5;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const reviewCount = await prisma.codeReview.count({
        where: {
          userId,
          createdAt: { gte: today },
        },
      });

      if (reviewCount >= limit) {
        return res.status(403).json({ 
          error: `Daily limit reached for ${plan} plan (${limit} reviews/day). Upgrade to get more!`,
          plan,
          limit,
          upgradeRequired: true
        });
      }
    } else {
        // Unauthenticated users (Limited by IP rate limiter mainly, but let's be strict here if needed)
        // For now, rely on rate limiter.
    }

    // Get AI review
    const reviewResult = await reviewCode(code, language);

    // Save to database (even if guest, we might want to save it without userId or skip)
    // Saving guest reviews makes them accessible by ID if returned.
    const codeReview = await prisma.codeReview.create({
      data: {
        userId: userId || null,
        code,
        language: language.toLowerCase(),
        score: reviewResult.score,
        issues: reviewResult.issues as any, // Cast JSON to any/Prisma Input
        suggestions: reviewResult.suggestions as any,
        resources: reviewResult.resources as any,
      },
    });

    res.status(201).json({ 
      review: {
        id: codeReview.id,
        score: reviewResult.score,
        issues: reviewResult.issues,
        suggestions: reviewResult.suggestions,
        resources: reviewResult.resources,
        createdAt: codeReview.createdAt,
      }
    });
  } catch (error: any) {
    console.error('Create code review error:', error);
    
    if (error.message.includes('Failed to review code')) {
      return res.status(503).json({ error: 'AI review service temporarily unavailable' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's review history
export const getMyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.codeReview.findMany({
        where: { userId },
        select: {
          id: true,
          language: true,
          score: true,
          createdAt: true,
          code: true, 
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.codeReview.count({ where: { userId } }),
    ]);

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single review by ID
export const getReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const review = await prisma.codeReview.findUnique({
      where: { id: id as string },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Authorization: Public reviews (anonymous) or User's own reviews?
    // If review has a userId and it's NOT the current user, block it?
    // Or allow sharing? Let's assume private unless shared (for now private/owner only if user exists)
    if (review.userId && review.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this review' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get review stats for user
export const getReviewStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [totalReviews, averageScore, languageBreakdown] = await Promise.all([
      prisma.codeReview.count({ where: { userId } }),
      prisma.codeReview.aggregate({
        where: { userId },
        _avg: { score: true },
      }),
      prisma.codeReview.groupBy({
        by: ['language'],
        where: { userId },
        _count: true,
      }),
    ]);

    res.json({
      stats: {
        totalReviews,
        averageScore: Math.round(averageScore._avg.score || 0),
        languageBreakdown: languageBreakdown.map((item) => ({
          language: item.language,
          count: item._count,
        })),
      },
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
