import prisma from "../lib/prisma.js";
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const parsePositiveInt = (value, fallback, min = 1, max = 52) => {
    const n = Number(value);
    if (!Number.isFinite(n))
        return fallback;
    const normalized = Math.floor(n);
    if (normalized < min)
        return min;
    if (normalized > max)
        return max;
    return normalized;
};
const normalizeStringList = (value) => {
    if (!Array.isArray(value))
        return [];
    return value
        .map((item) => String(item || "").trim())
        .filter((item, index, arr) => item.length > 0 && arr.indexOf(item) === index)
        .slice(0, 8);
};
function buildWeekTasks(weekNumber, goal, focusAreas, preferredStack) {
    const focus = focusAreas.length > 0 ? focusAreas : ["implementation", "quality", "delivery"];
    const stackHint = preferredStack ? ` using ${preferredStack}` : "";
    return [
        {
            title: `Plan week ${weekNumber} execution`,
            description: `Define concrete outputs for this week tied to the goal: ${goal}.`,
        },
        {
            title: `Ship one meaningful milestone${stackHint}`,
            description: `Build and ship the main task in ${focus[(weekNumber - 1) % focus.length]}.`,
        },
        {
            title: "Review quality and document learnings",
            description: "Run a quick quality pass (edge cases, tests, readability) and document what improved.",
        },
    ];
}
function buildRoadmapBlueprint(input) {
    return Array.from({ length: input.durationWeeks }, (_, index) => {
        const weekNumber = index + 1;
        return {
            weekNumber,
            title: `Week ${weekNumber} - ${index === 0 ? "Foundation" : index === input.durationWeeks - 1 ? "Delivery" : "Build"}`,
            tasks: buildWeekTasks(weekNumber, input.goal, input.focusAreas, input.preferredStack),
        };
    });
}
function computeStreakDays(completionDates) {
    if (completionDates.length === 0) {
        return { currentStreakDays: 0, longestStreakDays: 0 };
    }
    const uniqueDays = [...new Set(completionDates.map((date) => new Date(date).toDateString()))]
        .map((day) => new Date(day))
        .sort((a, b) => a.getTime() - b.getTime());
    let longest = 1;
    let running = 1;
    for (let i = 1; i < uniqueDays.length; i += 1) {
        const diff = Math.round((uniqueDays[i].getTime() - uniqueDays[i - 1].getTime()) / DAY_MS);
        if (diff === 1) {
            running += 1;
            longest = Math.max(longest, running);
        }
        else {
            running = 1;
        }
    }
    let current = 1;
    for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
        const diff = Math.round((uniqueDays[i].getTime() - uniqueDays[i - 1].getTime()) / DAY_MS);
        if (diff === 1) {
            current += 1;
        }
        else {
            break;
        }
    }
    const today = new Date();
    const lastDay = uniqueDays[uniqueDays.length - 1];
    const daysSinceLast = Math.round((today.setHours(0, 0, 0, 0) - lastDay.setHours(0, 0, 0, 0)) / DAY_MS);
    if (daysSinceLast > 1)
        current = 0;
    return { currentStreakDays: current, longestStreakDays: longest };
}
function computeRoadmapStats(roadmap) {
    const allTasks = roadmap.weeks.flatMap((week) => week.tasks);
    const completedTasks = allTasks.filter((task) => task.isCompleted);
    const completionDates = completedTasks
        .map((task) => task.completedAt)
        .filter((date) => !!date);
    const elapsedWeeks = Math.floor((Date.now() - roadmap.createdAt.getTime()) / WEEK_MS) + 1;
    const currentWeekNumber = Math.max(1, Math.min(elapsedWeeks, roadmap.weeks.length || 1));
    const missedWeeks = roadmap.weeks
        .filter((week) => week.weekNumber <= currentWeekNumber)
        .filter((week) => week.tasks.length > 0 && week.tasks.every((task) => !task.isCompleted))
        .map((week) => week.weekNumber);
    const weekCompletionMap = roadmap.weeks.map((week) => {
        const total = week.tasks.length;
        const done = week.tasks.filter((task) => task.isCompleted).length;
        return {
            weekNumber: week.weekNumber,
            title: week.title,
            totalTasks: total,
            completedTasks: done,
            completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
        };
    });
    const { currentStreakDays, longestStreakDays } = computeStreakDays(completionDates);
    return {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        completionRate: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
        currentWeekNumber,
        missedWeeks,
        currentStreakDays,
        longestStreakDays,
        weekCompletionMap,
    };
}
function formatRoadmapExport(roadmap) {
    const lines = [];
    lines.push(`# ${roadmap.title}`);
    lines.push("");
    lines.push(`Goal: ${roadmap.goal}`);
    lines.push(`Active: ${roadmap.isActive ? "Yes" : "No"}`);
    lines.push(`Updated: ${roadmap.updatedAt.toISOString()}`);
    lines.push("");
    for (const week of roadmap.weeks) {
        lines.push(`## Week ${week.weekNumber}: ${week.title}`);
        if (week.tasks.length === 0) {
            lines.push("- No tasks");
        }
        else {
            for (const task of week.tasks) {
                lines.push(`- [${task.isCompleted ? "x" : " "}] ${task.title}${task.description ? ` - ${task.description}` : ""}`);
            }
        }
        lines.push("");
    }
    return lines.join("\n");
}
async function getRoadmapForUser(roadmapId, userId) {
    return prisma.roadmap.findFirst({
        where: {
            id: roadmapId,
            userId,
        },
        include: {
            workflow: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                },
            },
            weeks: {
                orderBy: { weekNumber: "asc" },
                include: {
                    tasks: {
                        orderBy: { createdAt: "asc" },
                    },
                },
            },
        },
    });
}
export const createRoadmap = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const goal = String(req.body?.goal || "").trim();
        if (!goal) {
            res.status(400).json({ message: "Goal is required" });
            return;
        }
        const titleInput = String(req.body?.title || "").trim();
        const title = titleInput || `Roadmap - ${goal.slice(0, 48)}`;
        const durationWeeks = parsePositiveInt(req.body?.durationWeeks, 8, 2, 16);
        const focusAreas = normalizeStringList(req.body?.focusAreas);
        const preferredStack = String(req.body?.preferredStack || "").trim() || undefined;
        const workflowId = req.body?.workflowId ? String(req.body.workflowId).trim() : undefined;
        if (workflowId) {
            const workflow = await prisma.workflow.findUnique({ where: { id: workflowId }, select: { id: true } });
            if (!workflow) {
                res.status(404).json({ message: "Workflow not found" });
                return;
            }
        }
        const blueprint = buildRoadmapBlueprint({
            durationWeeks,
            goal,
            focusAreas,
            preferredStack,
        });
        const roadmap = await prisma.roadmap.create({
            data: {
                userId,
                workflowId,
                title,
                goal,
                isActive: true,
                weeks: {
                    create: blueprint.map((week) => ({
                        weekNumber: week.weekNumber,
                        title: week.title,
                        tasks: {
                            create: week.tasks,
                        },
                    })),
                },
            },
            include: {
                workflow: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
                weeks: {
                    orderBy: { weekNumber: "asc" },
                    include: {
                        tasks: {
                            orderBy: { createdAt: "asc" },
                        },
                    },
                },
            },
        });
        await prisma.progressEvent.create({
            data: {
                userId,
                roadmapId: roadmap.id,
                eventType: "ROADMAP_CREATED",
                metadata: {
                    durationWeeks,
                    focusAreas,
                    preferredStack,
                },
            },
        });
        res.status(201).json({
            roadmap,
            stats: computeRoadmapStats(roadmap),
        });
    }
    catch (error) {
        console.error("Create roadmap error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getRoadmaps = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const roadmaps = await prisma.roadmap.findMany({
            where: { userId },
            orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
            include: {
                workflow: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
                weeks: {
                    orderBy: { weekNumber: "asc" },
                    include: {
                        tasks: {
                            orderBy: { createdAt: "asc" },
                        },
                    },
                },
            },
        });
        const items = roadmaps.map((item) => ({
            ...item,
            stats: computeRoadmapStats(item),
        }));
        res.status(200).json({ roadmaps: items });
    }
    catch (error) {
        console.error("Get roadmaps error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getRoadmapById = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const roadmapId = String(req.params.roadmapId || "").trim();
        const roadmap = await getRoadmapForUser(roadmapId, userId);
        if (!roadmap) {
            res.status(404).json({ message: "Roadmap not found" });
            return;
        }
        res.status(200).json({
            roadmap,
            stats: computeRoadmapStats(roadmap),
        });
    }
    catch (error) {
        console.error("Get roadmap by id error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const setRoadmapTaskCompletion = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const roadmapId = String(req.params.roadmapId || "").trim();
        const taskId = String(req.params.taskId || "").trim();
        const bodyValue = req.body?.isCompleted;
        const task = await prisma.roadmapTask.findFirst({
            where: {
                id: taskId,
                roadmapWeek: {
                    roadmapId,
                    roadmap: {
                        userId,
                    },
                },
            },
            select: {
                id: true,
                title: true,
                isCompleted: true,
            },
        });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        const isCompleted = bodyValue === undefined ? !task.isCompleted : Boolean(bodyValue);
        const updated = await prisma.roadmapTask.update({
            where: { id: taskId },
            data: {
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
            },
        });
        await prisma.progressEvent.create({
            data: {
                userId,
                roadmapId,
                eventType: isCompleted ? "ROADMAP_TASK_COMPLETED" : "ROADMAP_TASK_REOPENED",
                metadata: {
                    taskId,
                    taskTitle: task.title,
                },
            },
        });
        const roadmap = await getRoadmapForUser(roadmapId, userId);
        if (!roadmap) {
            res.status(404).json({ message: "Roadmap not found" });
            return;
        }
        res.status(200).json({
            message: "Task updated",
            task: updated,
            stats: computeRoadmapStats(roadmap),
        });
    }
    catch (error) {
        console.error("Set roadmap task completion error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const generateRoadmapWeek = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const roadmapId = String(req.params.roadmapId || "").trim();
        const roadmap = await getRoadmapForUser(roadmapId, userId);
        if (!roadmap) {
            res.status(404).json({ message: "Roadmap not found" });
            return;
        }
        const nextWeekNumber = (roadmap.weeks[roadmap.weeks.length - 1]?.weekNumber || 0) + 1;
        const focusAreas = normalizeStringList(req.body?.focusAreas);
        const preferredStack = String(req.body?.preferredStack || "").trim() || undefined;
        const tasks = buildWeekTasks(nextWeekNumber, roadmap.goal, focusAreas, preferredStack);
        const week = await prisma.roadmapWeek.create({
            data: {
                roadmapId,
                weekNumber: nextWeekNumber,
                title: `Week ${nextWeekNumber} - Build`,
                tasks: {
                    create: tasks,
                },
            },
            include: {
                tasks: true,
            },
        });
        await prisma.progressEvent.create({
            data: {
                userId,
                roadmapId,
                eventType: "ROADMAP_WEEK_GENERATED",
                metadata: {
                    weekNumber: nextWeekNumber,
                    taskCount: tasks.length,
                },
            },
        });
        res.status(201).json({
            message: "Weekly tasks generated",
            week,
        });
    }
    catch (error) {
        console.error("Generate roadmap week error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const replanRoadmap = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const roadmapId = String(req.params.roadmapId || "").trim();
        const roadmap = await getRoadmapForUser(roadmapId, userId);
        if (!roadmap) {
            res.status(404).json({ message: "Roadmap not found" });
            return;
        }
        const stats = computeRoadmapStats(roadmap);
        const backlogTasks = roadmap.weeks
            .filter((week) => stats.missedWeeks.includes(week.weekNumber))
            .flatMap((week) => week.tasks)
            .filter((task) => !task.isCompleted);
        if (backlogTasks.length === 0) {
            res.status(200).json({ message: "No missed tasks to re-plan", movedTasks: 0 });
            return;
        }
        const catchUpWeekNumber = (roadmap.weeks[roadmap.weeks.length - 1]?.weekNumber || 0) + 1;
        const catchUpWeek = await prisma.roadmapWeek.create({
            data: {
                roadmapId,
                weekNumber: catchUpWeekNumber,
                title: `Week ${catchUpWeekNumber} - Catch-up Sprint`,
            },
        });
        for (const task of backlogTasks) {
            await prisma.roadmapTask.update({
                where: { id: task.id },
                data: {
                    roadmapWeekId: catchUpWeek.id,
                },
            });
        }
        await prisma.progressEvent.create({
            data: {
                userId,
                roadmapId,
                eventType: "ROADMAP_REPLANNED",
                metadata: {
                    movedTasks: backlogTasks.length,
                    toWeekNumber: catchUpWeekNumber,
                },
            },
        });
        const updated = await getRoadmapForUser(roadmapId, userId);
        if (!updated) {
            res.status(404).json({ message: "Roadmap not found" });
            return;
        }
        res.status(200).json({
            message: "Roadmap re-planned",
            movedTasks: backlogTasks.length,
            roadmap: updated,
            stats: computeRoadmapStats(updated),
        });
    }
    catch (error) {
        console.error("Replan roadmap error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const exportRoadmap = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const roadmapId = String(req.params.roadmapId || "").trim();
        const format = String(req.query.format || "markdown").toLowerCase();
        const roadmap = await getRoadmapForUser(roadmapId, userId);
        if (!roadmap) {
            res.status(404).json({ message: "Roadmap not found" });
            return;
        }
        const content = formatRoadmapExport(roadmap);
        res.status(200).json({
            format,
            fileName: `${roadmap.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "roadmap"}.md`,
            content,
            exportedAt: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Export roadmap error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getRoadmapShareCard = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const roadmapId = String(req.params.roadmapId || "").trim();
        const roadmap = await getRoadmapForUser(roadmapId, userId);
        if (!roadmap) {
            res.status(404).json({ message: "Roadmap not found" });
            return;
        }
        const stats = computeRoadmapStats(roadmap);
        const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/roadmaps/${roadmap.id}`;
        const shareText = [
            `I am using VibeShip to execute: ${roadmap.title}`,
            `Goal: ${roadmap.goal}`,
            `Progress: ${stats.completedTasks}/${stats.totalTasks} tasks completed (${stats.completionRate}%).`,
            `Current streak: ${stats.currentStreakDays} day(s).`,
            `Track: ${shareUrl}`,
        ].join("\n");
        res.status(200).json({
            shareUrl,
            shareText,
            stats,
        });
    }
    catch (error) {
        console.error("Get roadmap share card error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
