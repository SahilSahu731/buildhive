import prisma from '../lib/prisma.js';
// Express Interest in a Project
export const expressInterest = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { message } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id: String(projectId) }
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Prevent owner from applying
        if (project.userId === userId) {
            res.status(400).json({ message: "You cannot apply to your own project" });
            return;
        }
        // Check if already interested
        const existingInterest = await prisma.interest.findUnique({
            where: {
                projectId_userId: {
                    projectId: String(projectId),
                    userId: String(userId)
                }
            }
        });
        if (existingInterest) {
            res.status(400).json({ message: "You have already expressed interest in this project" });
            return;
        }
        const interest = await prisma.interest.create({
            data: {
                projectId: String(projectId),
                userId: String(userId),
                message: message ? String(message) : "",
                status: "pending"
            }
        });
        // TODO: Send Email Notification to Owner
        res.status(201).json(interest);
    }
    catch (error) {
        console.error("Express Interest Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Get Status for Current User
export const getInterestStatus = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(200).json({ status: null }); // Not logged in
            return;
        }
        const interest = await prisma.interest.findUnique({
            where: {
                projectId_userId: {
                    projectId: String(projectId),
                    userId: String(userId)
                }
            }
        });
        res.status(200).json({ status: interest ? interest.status : null });
    }
    catch (error) {
        console.error("Check Interest Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Get All Interests for a Project (Owner Only)
export const getProjectInterests = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.userId;
        const project = await prisma.project.findUnique({
            where: { id: String(projectId) }
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        if (project.userId !== userId) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        const interests = await prisma.interest.findMany({
            where: { projectId: String(projectId) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        githubUsername: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(interests);
    }
    catch (error) {
        console.error("Get Project Interests Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Update Interest Status (Accept/Reject)
export const updateInterestStatus = async (req, res) => {
    try {
        const { interestId } = req.params;
        const { status } = req.body; // 'accepted' | 'rejected'
        const userId = req.user?.userId;
        const interest = await prisma.interest.findUnique({
            where: { id: String(interestId) },
            include: { project: true }
        });
        if (!interest) {
            res.status(404).json({ message: "Interest not found" });
            return;
        }
        // Verify Owner
        if (interest.project.userId !== userId) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        const updatedInterest = await prisma.interest.update({
            where: { id: String(interestId) },
            data: { status: String(status) }
        });
        // TODO: Send Email Notification to Applicant
        res.status(200).json(updatedInterest);
    }
    catch (error) {
        console.error("Update Interest Status Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Get My Applications (For Dashboard)
export const getMyInterests = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const interests = await prisma.interest.findMany({
            where: { userId: String(userId) },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        category: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(interests);
    }
    catch (error) {
        console.error("Get My Interests Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
