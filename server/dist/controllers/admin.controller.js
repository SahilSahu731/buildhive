import prisma from '../lib/prisma.js';
// Get Dashboard Statistics
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalProjects = await prisma.project.count();
        const totalReviews = await prisma.codeReview.count();
        // Subscription breakdown
        const freeUsers = await prisma.user.count({ where: { plan: 'FREE' } });
        const premiumUsers = await prisma.user.count({ where: { plan: 'PREMIUM' } });
        const proUsers = await prisma.user.count({ where: { plan: 'PRO' } });
        // Calculate "Estimated" MRR based on current active plans
        // Premium: 99, Pro: 299
        const mrr = (premiumUsers * 99) + (proUsers * 299);
        res.status(200).json({
            users: {
                total: totalUsers,
                free: freeUsers,
                premium: premiumUsers,
                pro: proUsers
            },
            projects: totalProjects,
            reviews: totalReviews,
            revenue: {
                mrr: mrr
            }
        });
    }
    catch (error) {
        console.error("Get Admin Stats Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Get All Users with Pagination
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = await prisma.user.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                createdAt: true,
                _count: {
                    select: { projects: true, codeReviews: true }
                }
            }
        });
        const total = await prisma.user.count();
        res.status(200).json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total
        });
    }
    catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Update User (Role, Plan)
export const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { role, plan } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                role: role, // 'user' or 'admin'
                plan: plan // 'FREE', 'PREMIUM', 'PRO'
            }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Delete User
export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.user.delete({ where: { id } });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Get All Projects for Admin
export const getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const projects = await prisma.project.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });
        const total = await prisma.project.count();
        res.status(200).json({
            projects,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalProjects: total
        });
    }
    catch (error) {
        console.error("Get All Projects Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Change Project Status (e.g., flag content)
export const deleteProject = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.project.delete({ where: { id } });
        res.status(200).json({ message: "Project deleted successfully" });
    }
    catch (error) {
        console.error("Delete Project Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
