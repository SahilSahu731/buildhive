import prisma from "../lib/prisma.js";
const parsePositiveInt = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};
function resolveResumeStep(steps, progressMap) {
    if (steps.length === 0)
        return null;
    const lastVisited = [...steps]
        .map((step) => ({
        step,
        progress: progressMap.get(step.id),
    }))
        .filter((item) => !!item.progress)
        .sort((a, b) => (b.progress?.lastVisitedAt?.getTime() || 0) - (a.progress?.lastVisitedAt?.getTime() || 0))[0];
    if (lastVisited?.step && !lastVisited.progress?.isCompleted) {
        return lastVisited.step;
    }
    const firstIncomplete = steps.find((step) => !progressMap.get(step.id)?.isCompleted);
    if (firstIncomplete)
        return firstIncomplete;
    return steps[steps.length - 1];
}
export const getWorkflows = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const stack = req.query.stack ? String(req.query.stack).trim() : undefined;
        const difficulty = req.query.difficulty ? String(req.query.difficulty).trim() : undefined;
        const useCase = req.query.useCase ? String(req.query.useCase).trim() : undefined;
        const search = req.query.search ? String(req.query.search).trim() : undefined;
        const page = parsePositiveInt(req.query.page, 1);
        const limit = parsePositiveInt(req.query.limit, 12);
        const skip = (page - 1) * limit;
        const where = {
            isPublished: true,
        };
        if (stack)
            where.tags = { has: stack };
        if (difficulty)
            where.difficulty = difficulty;
        if (useCase)
            where.useCase = { contains: useCase, mode: "insensitive" };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { summary: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
            ];
        }
        const [workflows, totalCount] = await Promise.all([
            prisma.workflow.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ updatedAt: "desc" }],
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    summary: true,
                    category: true,
                    useCase: true,
                    difficulty: true,
                    estimatedMinutes: true,
                    tags: true,
                    _count: {
                        select: { steps: true },
                    },
                },
            }),
            prisma.workflow.count({ where }),
        ]);
        const workflowIds = workflows.map((item) => item.id);
        let bookmarkSet = new Set();
        let resumeMap = new Map();
        if (userId && workflowIds.length > 0) {
            const [bookmarks, progressRows] = await Promise.all([
                prisma.workflowBookmark.findMany({
                    where: {
                        userId,
                        workflowId: { in: workflowIds },
                    },
                    select: {
                        workflowId: true,
                    },
                }),
                prisma.workflowStepProgress.findMany({
                    where: {
                        userId,
                        workflowId: { in: workflowIds },
                    },
                    orderBy: {
                        lastVisitedAt: "desc",
                    },
                    distinct: ["workflowId"],
                    include: {
                        step: {
                            select: {
                                id: true,
                                stepOrder: true,
                                title: true,
                            },
                        },
                    },
                }),
            ]);
            bookmarkSet = new Set(bookmarks.map((item) => item.workflowId));
            resumeMap = new Map(progressRows
                .filter((row) => !!row.step)
                .map((row) => [row.workflowId, row.step]));
        }
        const items = workflows.map((item) => ({
            ...item,
            stepCount: item._count.steps,
            isBookmarked: bookmarkSet.has(item.id),
            resumeStep: resumeMap.get(item.id) || null,
        }));
        res.status(200).json({
            workflows: items,
            totalCount,
            page,
            totalPages: Math.max(1, Math.ceil(totalCount / limit)),
        });
    }
    catch (error) {
        console.error("Get workflows error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getWorkflowBySlug = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const slug = String(req.params.slug || "").trim();
        const workflow = await prisma.workflow.findUnique({
            where: { slug },
            include: {
                steps: {
                    orderBy: {
                        stepOrder: "asc",
                    },
                },
            },
        });
        if (!workflow || !workflow.isPublished) {
            res.status(404).json({ message: "Workflow not found" });
            return;
        }
        let progressMap = new Map();
        let isBookmarked = false;
        if (userId && workflow.steps.length > 0) {
            const [bookmark, progress] = await Promise.all([
                prisma.workflowBookmark.findUnique({
                    where: {
                        userId_workflowId: {
                            userId,
                            workflowId: workflow.id,
                        },
                    },
                }),
                prisma.workflowStepProgress.findMany({
                    where: {
                        userId,
                        workflowId: workflow.id,
                        stepId: { in: workflow.steps.map((step) => step.id) },
                    },
                    select: {
                        stepId: true,
                        isCompleted: true,
                        lastVisitedAt: true,
                        completedAt: true,
                    },
                }),
            ]);
            isBookmarked = !!bookmark;
            progressMap = new Map(progress.map((item) => [
                item.stepId,
                {
                    isCompleted: item.isCompleted,
                    lastVisitedAt: item.lastVisitedAt,
                    completedAt: item.completedAt,
                },
            ]));
        }
        const steps = workflow.steps.map((step) => {
            const progress = progressMap.get(step.id);
            return {
                ...step,
                isCompleted: progress?.isCompleted || false,
                completedAt: progress?.completedAt || null,
            };
        });
        const resumeStep = resolveResumeStep(steps.map((step) => ({ id: step.id, stepOrder: step.stepOrder, title: step.title })), progressMap);
        res.status(200).json({
            ...workflow,
            steps,
            isBookmarked,
            resumeStep,
        });
    }
    catch (error) {
        console.error("Get workflow details error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const setWorkflowStepCompletion = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const workflowId = String(req.params.workflowId || "").trim();
        const stepId = String(req.params.stepId || "").trim();
        const isCompleted = req.body?.isCompleted === undefined ? true : Boolean(req.body?.isCompleted);
        const step = await prisma.workflowStep.findFirst({
            where: {
                id: stepId,
                workflowId,
            },
            select: {
                id: true,
                workflowId: true,
                stepOrder: true,
                title: true,
            },
        });
        if (!step) {
            res.status(404).json({ message: "Workflow step not found" });
            return;
        }
        const progress = await prisma.workflowStepProgress.upsert({
            where: {
                userId_stepId: {
                    userId,
                    stepId,
                },
            },
            update: {
                workflowId,
                isCompleted,
                lastVisitedAt: new Date(),
                completedAt: isCompleted ? new Date() : null,
            },
            create: {
                userId,
                workflowId,
                stepId,
                isCompleted,
                lastVisitedAt: new Date(),
                completedAt: isCompleted ? new Date() : null,
            },
            select: {
                userId: true,
                workflowId: true,
                stepId: true,
                isCompleted: true,
                lastVisitedAt: true,
                completedAt: true,
            },
        });
        await prisma.progressEvent.create({
            data: {
                userId,
                workflowId,
                eventType: isCompleted ? "WORKFLOW_STEP_COMPLETED" : "WORKFLOW_STEP_REOPENED",
                metadata: {
                    stepId,
                    stepOrder: step.stepOrder,
                    stepTitle: step.title,
                },
            },
        });
        res.status(200).json({
            message: "Workflow step updated",
            progress,
        });
    }
    catch (error) {
        console.error("Set workflow step completion error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getWorkflowResumeStep = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const workflowId = String(req.params.workflowId || "").trim();
        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
            include: {
                steps: {
                    orderBy: {
                        stepOrder: "asc",
                    },
                    select: {
                        id: true,
                        stepOrder: true,
                        title: true,
                    },
                },
            },
        });
        if (!workflow || workflow.steps.length === 0) {
            res.status(404).json({ message: "Workflow not found" });
            return;
        }
        const progressRows = await prisma.workflowStepProgress.findMany({
            where: {
                userId,
                workflowId,
                stepId: { in: workflow.steps.map((step) => step.id) },
            },
            select: {
                stepId: true,
                isCompleted: true,
                lastVisitedAt: true,
                completedAt: true,
            },
        });
        const progressMap = new Map(progressRows.map((row) => [
            row.stepId,
            {
                isCompleted: row.isCompleted,
                lastVisitedAt: row.lastVisitedAt,
                completedAt: row.completedAt,
            },
        ]));
        const resumeStep = resolveResumeStep(workflow.steps, progressMap);
        if (resumeStep) {
            await prisma.workflowStepProgress.upsert({
                where: {
                    userId_stepId: {
                        userId,
                        stepId: resumeStep.id,
                    },
                },
                update: {
                    workflowId,
                    lastVisitedAt: new Date(),
                },
                create: {
                    userId,
                    workflowId,
                    stepId: resumeStep.id,
                    isCompleted: false,
                    lastVisitedAt: new Date(),
                },
            });
        }
        res.status(200).json({
            workflowId,
            resumeStep,
        });
    }
    catch (error) {
        console.error("Get workflow resume error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const saveWorkflowBookmark = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const workflowId = String(req.params.workflowId || "").trim();
        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
            select: { id: true },
        });
        if (!workflow) {
            res.status(404).json({ message: "Workflow not found" });
            return;
        }
        await prisma.workflowBookmark.upsert({
            where: {
                userId_workflowId: {
                    userId,
                    workflowId,
                },
            },
            update: {},
            create: {
                userId,
                workflowId,
            },
        });
        res.status(200).json({
            message: "Workflow bookmarked",
            isBookmarked: true,
        });
    }
    catch (error) {
        console.error("Save workflow bookmark error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const removeWorkflowBookmark = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const workflowId = String(req.params.workflowId || "").trim();
        await prisma.workflowBookmark.deleteMany({
            where: {
                userId,
                workflowId,
            },
        });
        res.status(200).json({
            message: "Workflow bookmark removed",
            isBookmarked: false,
        });
    }
    catch (error) {
        console.error("Remove workflow bookmark error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
