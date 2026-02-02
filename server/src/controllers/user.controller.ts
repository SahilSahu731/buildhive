
import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { uploadToCloudinary } from '../lib/cloudinary-upload.js';

// Get Current User Profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        skills: true,
        githubUsername: true,
        githubUrl: true,
        createdAt: true,
        role: true,
      }
    });

    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get My Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User Profile by Username (Public)
export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { username } = req.params;

        // Try finding by githubUsername first (assuming it's the public handle)
        // Or we can assume 'id' if username is not found, but better to enforce username usage
        // Since we don't have a dedicated 'username' field besides githubUsername, we might need one or reuse it.
        // For now, let's search by githubUsername if available, or fallback?
        // Actually, let's assume the route param is :id or :username.
        
        // Let's implement searching by githubUsername OR a new username field if we had one.
        // For now, let's look up by githubUsername as the public handle.
        
        let user: any = await prisma.user.findUnique({
            where: { githubUsername: String(username) },
            include: {
                projects: {
                    where: { status: 'open' },
                    orderBy: { createdAt: 'desc' },
                    take: 6
                }
            }
        });

        if (!user) {
             // Fallback: Check if it's a direct ID 
             user = await prisma.user.findUnique({
                where: { id: String(username) },
                include: {
                    projects: {
                        where: { status: 'open' },
                        orderBy: { createdAt: 'desc' },
                        take: 6
                    }
                }
             });
        }

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Remove sensitive data
        const publicProfile = {
            id: user.id,
            name: user.name,
            image: user.image,
            bio: user.bio,
            skills: user.skills,
            githubUsername: user.githubUsername,
            githubUrl: user.githubUrl,
            createdAt: user.createdAt,
            projects: user.projects
        };

        res.status(200).json(publicProfile);

    } catch (error) {
        console.error("Get Public Profile Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Update Profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { name, bio, skills } = req.body;
        const file = req.file;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

         let parsedSkills = skills;
         if (typeof skills === 'string') {
             // Handle JSON stringified array or comma separated
             try {
                parsedSkills = JSON.parse(skills);
             } catch {
                parsedSkills = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
             }
         }

         let imageUrl = undefined;
         if (file) {
             imageUrl = await uploadToCloudinary(file.buffer);
         }

         const updatedUser = await prisma.user.update({
             where: { id: userId },
             data: {
                 name: name ? String(name) : undefined,
                 bio: bio ? String(bio) : undefined,
                 skills: Array.isArray(parsedSkills) ? parsedSkills : undefined,
                 image: imageUrl
             }
         });

         res.status(200).json(updatedUser);

    } catch (error) {
         console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
