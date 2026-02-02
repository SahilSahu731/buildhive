
import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { uploadToCloudinary } from '../lib/cloudinary-upload.js';

// Create a new project
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, techStack, lookingFor, demoUrl, repoUrl, difficulty, category } = req.body;
    let { images } = req.body;
    const userId = req.user?.userId;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
       res.status(401).json({ message: "Unauthorized" });
       return 
    }

    // Handle Tech Stack parsing
    let parsedTechStack = techStack;
    if (typeof techStack === 'string') {
        try {
            parsedTechStack = JSON.parse(techStack);
        } catch {
            parsedTechStack = techStack.split(',').map((t: string) => t.trim());
        }
    }

    // Handle Images
    let projectImages: string[] = [];
    if (images) {
        if (typeof images === 'string') {
             try {
                const parsed = JSON.parse(images);
                if (Array.isArray(parsed)) projectImages = parsed;
                else projectImages = [images]; 
             } catch {
                projectImages = [images];
             }
        } else if (Array.isArray(images)) {
            projectImages = images;
        }
    }

    // Upload new files
    if (files && files.length > 0) {
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
        const uploadedUrls = await Promise.all(uploadPromises);
        projectImages = [...projectImages, ...uploadedUrls];
    }

    const project = await prisma.project.create({
      data: {
        title: String(title),
        description: String(description),
        techStack: Array.isArray(parsedTechStack) ? parsedTechStack : [],
        lookingFor: String(lookingFor),
        images: projectImages,
        demoUrl: demoUrl ? String(demoUrl) : null,
        repoUrl: repoUrl ? String(repoUrl) : null,
        difficulty: difficulty ? String(difficulty) : "Intermediate",
        category: category ? String(category) : "Web Development",
        userId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all projects with pagination and filtering
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const pageQuery = req.query.page;
    const limitQuery = req.query.limit;
    const categoryQuery = req.query.category;
    const statusQuery = req.query.status;
    const sortQuery = req.query.sort;
    
    const page = pageQuery ? parseInt(String(pageQuery)) : 1;
    const limit = limitQuery ? parseInt(String(limitQuery)) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryQuery) {
        where.category = String(categoryQuery);
    }
    if (statusQuery) {
        where.status = String(statusQuery);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortQuery === 'popular') {
        orderBy = { createdAt: 'desc' }; 
    } else if (sortQuery === 'launching') {
        where.status = 'launching';
    }

    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            githubUsername: true
          }
        }
      }
    });

    const total = await prisma.project.count({ where });

    res.status(200).json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProjects: total
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single project details
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            githubUsername: true,
            githubUrl: true
          }
        }
      }
    });

    if (!project) {
       res.status(404).json({ message: "Project not found" });
       return
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Get Project Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update project
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { title, description, techStack, lookingFor, status, demoUrl, repoUrl, difficulty, category } = req.body;
    let { images } = req.body;
    const userId = req.user?.userId;
    const files = req.files as Express.Multer.File[];

    const existingProject = await prisma.project.findUnique({ where: { id } });

    if (!existingProject) {
       res.status(404).json({ message: "Project not found" });
       return
    }

    if (existingProject.userId !== userId) {
       res.status(403).json({ message: "Unauthorized to edit this project" });
       return
    }

    // Handle Tech Stack parsing
    let parsedTechStack = techStack;
    if (techStack && typeof techStack === 'string') {
        try {
             parsedTechStack = JSON.parse(techStack);
        } catch {
             parsedTechStack = techStack.split(',').map((t: string) => t.trim());
        }
    }

    // Handle Images
    let projectImages: string[] = [];
    if (images) {
         if (typeof images === 'string') {
             try {
                 const parsed = JSON.parse(images);
                 if (Array.isArray(parsed)) projectImages = parsed;
                 else projectImages = [images];
             } catch {
                 projectImages = [images];
             }
        } else if (Array.isArray(images)) {
             projectImages = images;
        }
    } else {
        if (images === undefined) {
             projectImages = existingProject.images;
        }
    }

    // Upload new files
    if (files && files.length > 0) {
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
        const uploadedUrls = await Promise.all(uploadPromises);
        projectImages = [...projectImages, ...uploadedUrls];
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: String(title),
        description: String(description),
        techStack: parsedTechStack ? (Array.isArray(parsedTechStack) ? parsedTechStack : []) : undefined,
        lookingFor: lookingFor ? String(lookingFor) : undefined,
        status: status ? String(status) : undefined,
        images: projectImages,
        demoUrl: demoUrl ? String(demoUrl) : null,
        repoUrl: repoUrl ? String(repoUrl) : null,
        difficulty: difficulty ? String(difficulty) : undefined,
        category: category ? String(category) : undefined,
      },
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete project
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user?.userId;

    const existingProject = await prisma.project.findUnique({ where: { id } });

    if (!existingProject) {
       res.status(404).json({ message: "Project not found" });
       return
    }

    if (existingProject.userId !== userId) {
       res.status(403).json({ message: "Unauthorized to delete this project" });
       return
    }

    await prisma.project.delete({ where: { id } });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get logged-in user's projects
export const getMyProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
       return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
            select: {
                id: true,
                name: true,
                image: true
            }
        }
      }
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Get My Projects Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
