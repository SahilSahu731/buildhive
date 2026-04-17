import { Response } from "express";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

const parsePositiveInt = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

export const getPromptPacks = async (req: AuthRequest, res: Response) => {
  try {
    const targetTool = req.query.targetTool ? String(req.query.targetTool).trim() : undefined;
    const tag = req.query.tag ? String(req.query.tag).trim() : undefined;
    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 12);
    const skip = (page - 1) * limit;

    const where: any = { isPublished: true };

    if (targetTool) {
      where.targetTool = { contains: targetTool, mode: "insensitive" };
    }
    if (tag) {
      where.tags = { has: tag };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [packs, totalCount] = await Promise.all([
      prisma.promptPack.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ updatedAt: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          targetTool: true,
          tags: true,
          workflowId: true,
          _count: {
            select: {
              templates: true,
            },
          },
        },
      }),
      prisma.promptPack.count({ where }),
    ]);

    res.status(200).json({
      promptPacks: packs.map((pack) => ({
        ...pack,
        templateCount: pack._count.templates,
      })),
      totalCount,
      page,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    });
  } catch (error) {
    console.error("Get prompt packs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPromptPackBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const slug = String(req.params.slug || "").trim();

    const promptPack = await prisma.promptPack.findUnique({
      where: { slug },
      include: {
        workflow: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        templates: {
          orderBy: [{ createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            description: true,
            content: true,
            variables: true,
            goodExample: true,
            badExample: true,
            createdAt: true,
          },
        },
      },
    });

    if (!promptPack || !promptPack.isPublished) {
      res.status(404).json({ message: "Prompt pack not found" });
      return;
    }

    const templateIds = promptPack.templates.map((template) => template.id);

    let favoriteSet = new Set<string>();
    let totalUsageMap = new Map<string, number>();
    let myUsageMap = new Map<string, number>();

    if (templateIds.length > 0) {
      const [favorites, usageTotals, myUsageTotals] = await Promise.all([
        userId
          ? prisma.promptTemplateFavorite.findMany({
              where: {
                userId,
                promptTemplateId: { in: templateIds },
              },
              select: {
                promptTemplateId: true,
              },
            })
          : Promise.resolve([]),
        prisma.promptTemplateUsage.groupBy({
          by: ["promptTemplateId"],
          where: {
            promptTemplateId: { in: templateIds },
          },
          _count: {
            promptTemplateId: true,
          },
        }),
        userId
          ? prisma.promptTemplateUsage.groupBy({
              by: ["promptTemplateId"],
              where: {
                userId,
                promptTemplateId: { in: templateIds },
              },
              _count: {
                promptTemplateId: true,
              },
            })
          : Promise.resolve([]),
      ]);

      favoriteSet = new Set(favorites.map((item) => item.promptTemplateId));

      totalUsageMap = new Map(
        usageTotals.map((row) => [row.promptTemplateId, row._count.promptTemplateId])
      );

      myUsageMap = new Map(
        myUsageTotals.map((row) => [row.promptTemplateId, row._count.promptTemplateId])
      );
    }

    const templatesWithStats = promptPack.templates.map((template) => ({
      ...template,
      isFavorite: favoriteSet.has(template.id),
      usageCount: totalUsageMap.get(template.id) || 0,
      myUsageCount: myUsageMap.get(template.id) || 0,
    }));

    res.status(200).json({
      ...promptPack,
      templates: templatesWithStats,
    });
  } catch (error) {
    console.error("Get prompt pack details error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const togglePromptTemplateFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const templateId = String(req.params.templateId || "").trim();

    const template = await prisma.promptTemplate.findUnique({
      where: { id: templateId },
      select: { id: true },
    });

    if (!template) {
      res.status(404).json({ message: "Prompt template not found" });
      return;
    }

    const existing = await prisma.promptTemplateFavorite.findUnique({
      where: {
        userId_promptTemplateId: {
          userId,
          promptTemplateId: templateId,
        },
      },
      select: { id: true },
    });

    const isFavorite = !existing;

    if (existing) {
      await prisma.promptTemplateFavorite.delete({ where: { id: existing.id } });
    } else {
      await prisma.promptTemplateFavorite.create({
        data: {
          userId,
          promptTemplateId: templateId,
        },
      });
    }

    const favoriteCount = await prisma.promptTemplateFavorite.count({
      where: {
        promptTemplateId: templateId,
      },
    });

    res.status(200).json({
      templateId,
      isFavorite,
      favoriteCount,
    });
  } catch (error) {
    console.error("Toggle prompt favorite error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const trackPromptTemplateUsage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const templateId = String(req.params.templateId || "").trim();
    const actionType = req.body?.actionType ? String(req.body.actionType).toUpperCase() : "COPY";

    const template = await prisma.promptTemplate.findUnique({
      where: { id: templateId },
      select: { id: true },
    });

    if (!template) {
      res.status(404).json({ message: "Prompt template not found" });
      return;
    }

    await prisma.promptTemplateUsage.create({
      data: {
        userId,
        promptTemplateId: templateId,
        actionType,
      },
    });

    const [usageCount, myUsageCount] = await Promise.all([
      prisma.promptTemplateUsage.count({ where: { promptTemplateId: templateId } }),
      prisma.promptTemplateUsage.count({ where: { promptTemplateId: templateId, userId } }),
    ]);

    res.status(201).json({
      templateId,
      actionType,
      usageCount,
      myUsageCount,
    });
  } catch (error) {
    console.error("Track prompt usage error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
