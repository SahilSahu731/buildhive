
import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { uploadToCloudinary } from '../lib/cloudinary-upload.js';
import { normalizeQuotaDate, resolvePlanLimit } from '../lib/usage-quota.js';
import {
    isDeleteConfirmationValid,
    normalizePreferredStack,
    normalizeSkills,
    toSkillLevel,
} from '../lib/profile-utils.js';

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
                skillLevel: true,
                goal: true,
                preferredStack: true,
                onboardingCompleted: true,
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
        const { name, bio, skills, skillLevel, goal, preferredStack } = req.body;
        const file = (req as any).file;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

            let parsedSkills = skills;
            if (typeof skills === 'string') {
                 try {
                     parsedSkills = JSON.parse(skills);
                 } catch {
                     parsedSkills = skills;
                 }
            }

         let imageUrl = undefined;
         if (file) {
             imageUrl = await uploadToCloudinary(file.buffer);
         }

         const normalizedSkills = normalizeSkills(parsedSkills);
         const normalizedSkillLevel = toSkillLevel(skillLevel ? String(skillLevel) : undefined);
         const normalizedPreferredStack = normalizePreferredStack(preferredStack ? String(preferredStack) : undefined);

         const updatedUser = await prisma.user.update({
             where: { id: userId },
             data: {
                 name: name ? String(name) : undefined,
                 bio: bio ? String(bio) : undefined,
                 skills: normalizedSkills,
                 skillLevel: normalizedSkillLevel,
                 goal: goal ? String(goal).trim() : undefined,
                 preferredStack: normalizedPreferredStack,
                 image: imageUrl
             }
         });

         res.status(200).json(updatedUser);

    } catch (error) {
         console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const completeOnboarding = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { skillLevel, goal, preferredStack, skills } = req.body;

        const parsedSkillLevel = toSkillLevel(skillLevel ? String(skillLevel) : undefined);
        const parsedGoal = goal ? String(goal).trim() : "";
        const parsedPreferredStack = normalizePreferredStack(preferredStack ? String(preferredStack) : undefined);
        const parsedSkills = normalizeSkills(skills) || [];

        if (!parsedSkillLevel) {
            res.status(400).json({ message: "Valid skill level is required." });
            return;
        }

        if (!parsedGoal) {
            res.status(400).json({ message: "Goal is required." });
            return;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                skillLevel: parsedSkillLevel,
                goal: parsedGoal,
                preferredStack: parsedPreferredStack,
                skills: parsedSkills,
                onboardingCompleted: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                onboardingCompleted: true,
                skillLevel: true,
                goal: true,
                preferredStack: true,
                skills: true,
            },
        });

        res.status(200).json({ message: "Onboarding completed", user });
    } catch (error) {
        console.error("Complete onboarding error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteMyAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { confirmText, email } = req.body;

        if (!isDeleteConfirmationValid(confirmText ? String(confirmText) : undefined)) {
            res.status(400).json({ message: "Please type DELETE to confirm account deletion." });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (email && String(email).trim().toLowerCase() !== user.email.toLowerCase()) {
            res.status(400).json({ message: "Email confirmation does not match your account." });
            return;
        }

        await prisma.user.delete({ where: { id: userId } });

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const today = normalizeQuotaDate();

        const [
            user,
            projectsCount,
            roadmapCount,
            lastStepProgress,
            progressEvents,
            todayQuota,
            activeRoadmap,
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    skillLevel: true,
                    goal: true,
                    preferredStack: true,
                    plan: true,
                    subscriptionStatus: true,
                    subscriptionEndDate: true,
                    createdAt: true,
                },
            }),
            prisma.project.count({ where: { userId } }),
            prisma.roadmap.count({ where: { userId, isActive: true } }),
            prisma.workflowStepProgress.findFirst({
                where: { userId },
                orderBy: { lastVisitedAt: 'desc' },
                include: {
                    step: {
                        select: { id: true, stepOrder: true, title: true },
                    },
                    workflow: {
                        select: { id: true, title: true, slug: true },
                    },
                },
            }),
            prisma.progressEvent.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 30,
            }),
            prisma.usageQuota.findUnique({
                where: {
                    userId_quotaDate_actionType: {
                        userId,
                        quotaDate: today,
                        actionType: 'WORKFLOW_ACTION',
                    },
                },
            }),
            prisma.roadmap.findFirst({
                where: { userId, isActive: true },
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    weeks: {
                        select: {
                            id: true,
                            weekNumber: true,
                            tasks: {
                                select: { id: true, isCompleted: true },
                            },
                        },
                    },
                },
            }),
        ]);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const planLimit = resolvePlanLimit(user.plan || 'FREE');
        const quotaUsage = todayQuota?.usedCount || 0;
        const quotaPercent = planLimit > 0 ? Math.min(Math.round((quotaUsage / planLimit) * 100), 100) : 100;

        const weeklyEvents = progressEvents.filter((event) => event.createdAt >= sevenDaysAgo);
        const completedWorkflowSteps = weeklyEvents.filter((event) => event.eventType === 'WORKFLOW_STEP_COMPLETED').length;
        const completedRoadmapTasks = weeklyEvents.filter((event) => event.eventType === 'ROADMAP_TASK_COMPLETED').length;
        const weeklyActiveDays = new Set(
            weeklyEvents.map((event) => new Date(event.createdAt).toDateString())
        ).size;

        const activeRoadmapCompletion = activeRoadmap
            ? (() => {
                const allTasks = activeRoadmap.weeks.flatMap((week) => week.tasks);
                const completed = allTasks.filter((task) => task.isCompleted).length;
                const total = allTasks.length;
                return {
                    roadmapId: activeRoadmap.id,
                    roadmapTitle: activeRoadmap.title,
                    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                };
            })()
            : null;

        const notifications = progressEvents.slice(0, 8).map((event) => {
            let title = 'Activity update';
            let message = 'There is a new update in your workspace.';

            if (event.eventType === 'WORKFLOW_STEP_COMPLETED') {
                title = 'Workflow progress';
                message = 'You completed a workflow step. Keep your streak going.';
            } else if (event.eventType === 'ROADMAP_TASK_COMPLETED') {
                title = 'Roadmap progress';
                message = 'A roadmap task was completed this week.';
            } else if (event.eventType === 'ROADMAP_REPLANNED') {
                title = 'Roadmap updated';
                message = 'Your roadmap was re-planned based on recent progress.';
            } else if (event.eventType === 'PROMPT_TEMPLATE_USED') {
                title = 'Prompt usage tracked';
                message = 'Your prompt usage stats have been updated.';
            }

            return {
                id: event.id,
                title,
                message,
                eventType: event.eventType,
                createdAt: event.createdAt,
            };
        });

        if (user.subscriptionEndDate) {
            const daysToRenewal = Math.ceil((new Date(user.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysToRenewal >= 0 && daysToRenewal <= 5) {
                notifications.unshift({
                    id: 'billing-renewal',
                    title: 'Subscription reminder',
                    message: `Your plan renews in ${daysToRenewal} day${daysToRenewal === 1 ? '' : 's'}.`,
                    eventType: 'SUBSCRIPTION_RENEWAL_REMINDER',
                    createdAt: new Date(),
                });
            }
        }

        if (quotaPercent >= 80 && user.plan === 'FREE') {
            notifications.unshift({
                id: 'free-tier-usage-warning',
                title: 'Usage limit warning',
                message: `You used ${quotaUsage}/${planLimit} actions today. Upgrade to avoid interruptions.`,
                eventType: 'FREE_TIER_WARNING',
                createdAt: new Date(),
            });
        }

        const quickActions = [
            {
                id: 'resume-workflow',
                label: lastStepProgress?.workflow ? 'Resume workflow' : 'Browse workflows',
                href: lastStepProgress?.workflow
                    ? `/workflows/${lastStepProgress.workflow.slug}?resume=${lastStepProgress.stepId}`
                    : '/workflows',
                description: lastStepProgress?.workflow
                    ? `Continue ${lastStepProgress.workflow.title} from step ${lastStepProgress.step.stepOrder}`
                    : 'Start with a guided workflow',
            },
            {
                id: 'open-roadmap',
                label: activeRoadmap ? 'Open active roadmap' : 'Create roadmap',
                href: activeRoadmap ? `/roadmaps/${activeRoadmap.id}` : '/roadmaps',
                description: activeRoadmap ? 'Stay aligned with your weekly plan' : 'Generate a roadmap in minutes',
            },
            {
                id: 'new-project',
                label: 'Create project',
                href: '/projects/new',
                description: projectsCount > 0 ? 'Ship your next outcome' : 'Publish your first project',
            },
        ];

        res.status(200).json({
            personalization: {
                name: user.name || 'Builder',
                skillLevel: user.skillLevel,
                goal: user.goal,
                preferredStack: user.preferredStack,
                plan: user.plan,
            },
            stats: {
                projectsCount,
                activeRoadmaps: roadmapCount,
                quotaUsage,
                quotaLimit: planLimit,
                quotaPercent,
            },
            continueCard: lastStepProgress?.workflow
                ? {
                    workflowId: lastStepProgress.workflow.id,
                    workflowSlug: lastStepProgress.workflow.slug,
                    workflowTitle: lastStepProgress.workflow.title,
                    stepId: lastStepProgress.step.id,
                    stepOrder: lastStepProgress.step.stepOrder,
                    stepTitle: lastStepProgress.step.title,
                    lastVisitedAt: lastStepProgress.lastVisitedAt,
                }
                : null,
            quickActions,
            weeklyRecap: {
                completedWorkflowSteps,
                completedRoadmapTasks,
                weeklyActiveDays,
                activeRoadmapCompletion,
            },
            notifications: notifications.slice(0, 10),
        });
    } catch (error) {
        console.error('Get dashboard summary error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
