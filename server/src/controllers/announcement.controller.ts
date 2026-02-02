
import { Response, Request } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Get Active Announcements (Public)
export const getActiveAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(announcements);
    } catch (error) {
        console.error("Get Active Announcements Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Get All Announcements
export const getAllAnnouncements = async (req: AuthRequest, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(announcements);
    } catch (error) {
        console.error("Get All Announcements Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Create Announcement
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
    try {
        const { message, type, isActive } = req.body;
        
        if (!message) {
             res.status(400).json({ message: "Message is required" });
             return;
        }

        const announcement = await prisma.announcement.create({
            data: {
                message,
                type: type || 'BANNER',
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.status(201).json(announcement);
    } catch (error) {
         console.error("Create Announcement Error:", error);
         res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Update Announcement
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { message, type, isActive } = req.body;

        const updated = await prisma.announcement.update({
            where: { id },
            data: {
                message,
                type,
                isActive
            }
        });

        res.status(200).json(updated);
    } catch (error) {
         console.error("Update Announcement Error:", error);
         res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Delete Announcement
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.announcement.delete({ where: { id } });
        res.status(200).json({ message: "Announcement deleted" });
    } catch (error) {
         console.error("Delete Announcement Error:", error);
         res.status(500).json({ message: "Internal server error" });
    }
};
