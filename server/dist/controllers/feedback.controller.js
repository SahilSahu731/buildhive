import prisma from '../lib/prisma.js';
// Submit Feedback (Authenticated or Anonymous - if we handle userId optional)
export const submitFeedback = async (req, res) => {
    try {
        const userId = req.user?.userId; // Optional
        const { type, title, description, rating } = req.body;
        if (!title || !description || !type) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const feedback = await prisma.feedback.create({
            data: {
                userId: userId || null,
                type,
                title,
                description,
                rating: rating ? parseInt(rating) : undefined,
                status: 'OPEN'
            }
        });
        res.status(201).json(feedback);
    }
    catch (error) {
        console.error("Submit Feedback Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Admin: Get All Feedbacks
export const getAllFeedbacks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const feedbacks = await prisma.feedback.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });
        const total = await prisma.feedback.count();
        res.status(200).json({
            feedbacks,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        console.error("Get All Feedbacks Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Admin: Update Status
export const updateFeedbackStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const updated = await prisma.feedback.update({
            where: { id },
            data: { status }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error("Update Feedback Status Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Admin: Delete Feedback
export const deleteFeedback = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.feedback.delete({ where: { id } });
        res.status(200).json({ message: "Feedback deleted" });
    }
    catch (error) {
        console.error("Delete Feedback Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
