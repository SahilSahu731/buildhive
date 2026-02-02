import rateLimit from 'express-rate-limit';
// Rate limiter for code review (public endpoint)
export const codeReviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 20, // 20 requests per hour for everyone (User ID limit is mostly strict, IP limit here)
    message: JSON.stringify({ error: 'Too many requests. Please try again later.' }), // Express sends string, but we want JSON structure usually. rate-limit supports object/string message.
    standardHeaders: true,
    legacyHeaders: false,
    // skip: (req) => !!req.user, // Don't skip, rate limit everyone to protect API costs or separate limits
});
