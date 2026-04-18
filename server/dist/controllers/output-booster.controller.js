import prisma from "../lib/prisma.js";
const MAX_INPUT_LENGTH = 150000;
const severityPenalty = {
    LOW: 4,
    MEDIUM: 9,
    HIGH: 18,
};
const emptySeverityCounts = () => ({
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
});
const emptyCategoryCounts = () => ({
    READABILITY: 0,
    TEST_GAPS: 0,
    SECURITY: 0,
});
function addIssue(issues, issue) {
    issues.push({
        id: `issue_${issues.length + 1}`,
        ...issue,
    });
}
function findLineHint(code, needle) {
    const index = code.indexOf(needle);
    if (index < 0)
        return undefined;
    return code.slice(0, index).split("\n").length;
}
function analyzeReadability(code, issues) {
    const lines = code.split("\n");
    const longLines = lines.filter((line) => line.length > 120).length;
    if (longLines > 0) {
        addIssue(issues, {
            category: "READABILITY",
            severity: longLines >= 5 ? "MEDIUM" : "LOW",
            title: "Long lines reduce readability",
            detail: `Detected ${longLines} line(s) longer than 120 characters.`,
            suggestion: "Break long statements into smaller expressions and extract helper functions.",
            copyablePrompt: "Refactor this code to reduce long lines and improve readability without changing behavior.",
        });
    }
    const todoMentions = code.match(/TODO|FIXME|HACK/gm)?.length || 0;
    if (todoMentions > 0) {
        addIssue(issues, {
            category: "READABILITY",
            severity: todoMentions >= 4 ? "MEDIUM" : "LOW",
            title: "Pending TODOs in implementation",
            detail: `Found ${todoMentions} TODO/FIXME/HACK markers that likely represent unfinished work.`,
            suggestion: "Convert TODOs into tracked tasks and close critical ones before shipping.",
            copyablePrompt: "Review this code and produce a prioritized plan to resolve TODO/FIXME/HACK items.",
        });
    }
    const functionBlockMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*\{|=>\s*\{/g) || [];
    if (functionBlockMatches.length > 0 && code.split("\n").length / functionBlockMatches.length > 120) {
        addIssue(issues, {
            category: "READABILITY",
            severity: "MEDIUM",
            title: "Large functions may be doing too much",
            detail: "Average function size appears high; consider splitting responsibilities.",
            suggestion: "Extract pure helper functions and keep each function focused on one responsibility.",
            copyablePrompt: "Split this code into smaller focused functions and keep external behavior unchanged.",
        });
    }
}
function analyzeTestingGaps(code, issues) {
    const hasTestSignals = /describe\(|it\(|test\(|expect\(|assert\./.test(code);
    if (!hasTestSignals) {
        addIssue(issues, {
            category: "TEST_GAPS",
            severity: "HIGH",
            title: "No visible test coverage",
            detail: "Could not detect test scaffolding or assertions in the provided code.",
            suggestion: "Add unit tests for happy path, edge cases, and error scenarios.",
            copyablePrompt: "Generate focused unit tests for this code, including edge cases and failure scenarios.",
        });
    }
    const hasBranching = /\bif\b|\bswitch\b|\bcatch\b|\?\s*[^:]+\s*:/.test(code);
    if (hasBranching && !/error|throw|reject|fail/i.test(code)) {
        addIssue(issues, {
            category: "TEST_GAPS",
            severity: "MEDIUM",
            title: "Potential missing negative-path tests",
            detail: "Control flow exists but explicit failure-path coverage is not obvious.",
            suggestion: "Add tests for invalid inputs, external failures, and timeout or exception paths.",
            copyablePrompt: "Add missing negative-path tests for this code (invalid input, exceptions, external failures).",
        });
    }
}
function analyzeSecurity(code, issues) {
    const rules = [
        {
            regex: /eval\(/,
            severity: "HIGH",
            title: "Dynamic eval detected",
            detail: "`eval` can execute untrusted code and is a major security risk.",
            suggestion: "Replace dynamic evaluation with safe parsing or explicit condition mapping.",
            prompt: "Replace eval usage with a safe alternative while preserving functionality.",
            needle: "eval(",
        },
        {
            regex: /dangerouslySetInnerHTML|innerHTML\s*=|outerHTML\s*=/,
            severity: "HIGH",
            title: "Unsafe HTML injection pattern",
            detail: "Direct HTML injection can create XSS risk if input is not sanitized.",
            suggestion: "Use safe rendering and sanitize any user-provided HTML before output.",
            prompt: "Refactor this code to remove unsafe HTML injection and mitigate XSS risks.",
            needle: "innerHTML",
        },
        {
            regex: /child_process|exec\(|spawn\(/,
            severity: "HIGH",
            title: "Command execution surface",
            detail: "Process execution APIs require strict input validation and escaping.",
            suggestion: "Whitelist commands, validate inputs strictly, and avoid shell interpolation.",
            prompt: "Audit and harden this command execution flow against injection and unsafe shell usage.",
            needle: "exec(",
        },
        {
            regex: /password\s*=\s*["'][^"']+["']|api[_-]?key\s*=\s*["'][^"']+["']/i,
            severity: "MEDIUM",
            title: "Possible hardcoded secret",
            detail: "Detected a literal credential-like string assignment.",
            suggestion: "Move secrets to environment variables and rotate exposed tokens.",
            prompt: "Replace hardcoded secrets in this code with environment-based configuration.",
            needle: "password",
        },
    ];
    for (const rule of rules) {
        if (rule.regex.test(code)) {
            addIssue(issues, {
                category: "SECURITY",
                severity: rule.severity,
                title: rule.title,
                detail: rule.detail,
                suggestion: rule.suggestion,
                copyablePrompt: rule.prompt,
                lineHint: findLineHint(code, rule.needle),
            });
        }
    }
}
function buildSummary(issues) {
    const countsBySeverity = emptySeverityCounts();
    const countsByCategory = emptyCategoryCounts();
    const groupedIssues = {
        READABILITY: [],
        TEST_GAPS: [],
        SECURITY: [],
    };
    for (const issue of issues) {
        countsBySeverity[issue.severity] += 1;
        countsByCategory[issue.category] += 1;
        groupedIssues[issue.category].push(issue);
    }
    const penalty = issues.reduce((total, issue) => total + severityPenalty[issue.severity], 0);
    const score = Math.max(10, 100 - penalty);
    return {
        score,
        issueCount: issues.length,
        countsBySeverity,
        countsByCategory,
        groupedIssues,
    };
}
function parseRunMetadata(metadata) {
    const data = (metadata && typeof metadata === "object" ? metadata : {});
    return {
        runId: data.runId || "",
        fileName: data.fileName || "snippet",
        language: data.language || "unknown",
        sourceType: data.sourceType || "paste",
        summary: data.summary,
        issues: Array.isArray(data.issues) ? data.issues : [],
        suggestedFixes: Array.isArray(data.suggestedFixes) ? data.suggestedFixes : [],
        inputPreview: data.inputPreview || "",
        lineCount: typeof data.lineCount === "number" ? data.lineCount : 0,
        createdAt: data.createdAt,
    };
}
export const analyzeOutput = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const content = String(req.body?.content || "");
        const language = String(req.body?.language || "text").trim().toLowerCase();
        const fileName = String(req.body?.fileName || "snippet").trim() || "snippet";
        const sourceType = String(req.body?.sourceType || "paste").trim().toLowerCase();
        if (!content.trim()) {
            res.status(400).json({ message: "Code content is required" });
            return;
        }
        if (content.length > MAX_INPUT_LENGTH) {
            res.status(400).json({ message: "Input is too large for analysis" });
            return;
        }
        const issues = [];
        analyzeReadability(content, issues);
        analyzeTestingGaps(content, issues);
        analyzeSecurity(content, issues);
        const summary = buildSummary(issues);
        const suggestedFixes = [...new Set(issues.map((item) => item.suggestion))].slice(0, 6);
        const event = await prisma.progressEvent.create({
            data: {
                userId,
                eventType: "OUTPUT_BOOSTER_RUN",
                metadata: {
                    fileName,
                    language,
                    sourceType,
                    inputPreview: content.slice(0, 800),
                    lineCount: content.split("\n").length,
                    summary,
                    issues,
                    suggestedFixes,
                    createdAt: new Date().toISOString(),
                },
            },
        });
        await prisma.progressEvent.update({
            where: { id: event.id },
            data: {
                metadata: {
                    fileName,
                    language,
                    sourceType,
                    inputPreview: content.slice(0, 800),
                    lineCount: content.split("\n").length,
                    summary,
                    issues,
                    suggestedFixes,
                    runId: event.id,
                    createdAt: new Date().toISOString(),
                },
            },
        });
        res.status(200).json({
            runId: event.id,
            fileName,
            language,
            sourceType,
            summary,
            issues,
            suggestedFixes,
            createdAt: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Analyze output error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getOutputBoosterHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const limit = Math.max(1, Math.min(Number(req.query.limit || 20), 50));
        const events = await prisma.progressEvent.findMany({
            where: {
                userId,
                eventType: "OUTPUT_BOOSTER_RUN",
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
            select: {
                id: true,
                createdAt: true,
                metadata: true,
            },
        });
        const history = events.map((event) => {
            const parsed = parseRunMetadata(event.metadata);
            return {
                runId: parsed.runId || event.id,
                createdAt: event.createdAt.toISOString(),
                fileName: parsed.fileName,
                language: parsed.language,
                sourceType: parsed.sourceType,
                lineCount: parsed.lineCount,
                summary: parsed.summary,
                issues: parsed.issues,
                suggestedFixes: parsed.suggestedFixes,
            };
        });
        res.status(200).json({ history });
    }
    catch (error) {
        console.error("Get output booster history error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const compareOutputBoosterRuns = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const runA = String(req.query.runA || "").trim();
        const runB = String(req.query.runB || "").trim();
        if (!runA || !runB) {
            res.status(400).json({ message: "Both runA and runB are required" });
            return;
        }
        const events = await prisma.progressEvent.findMany({
            where: {
                userId,
                id: { in: [runA, runB] },
                eventType: "OUTPUT_BOOSTER_RUN",
            },
            select: {
                id: true,
                createdAt: true,
                metadata: true,
            },
        });
        if (events.length !== 2) {
            res.status(404).json({ message: "Could not find both analysis runs" });
            return;
        }
        const eventById = new Map(events.map((event) => [event.id, event]));
        const a = eventById.get(runA);
        const b = eventById.get(runB);
        if (!a || !b) {
            res.status(404).json({ message: "Could not find both analysis runs" });
            return;
        }
        const metaA = parseRunMetadata(a.metadata);
        const metaB = parseRunMetadata(b.metadata);
        const summaryA = metaA.summary || {
            score: 0,
            issueCount: 0,
            countsBySeverity: emptySeverityCounts(),
            countsByCategory: emptyCategoryCounts(),
            groupedIssues: { READABILITY: [], TEST_GAPS: [], SECURITY: [] },
        };
        const summaryB = metaB.summary || {
            score: 0,
            issueCount: 0,
            countsBySeverity: emptySeverityCounts(),
            countsByCategory: emptyCategoryCounts(),
            groupedIssues: { READABILITY: [], TEST_GAPS: [], SECURITY: [] },
        };
        const delta = {
            score: summaryB.score - summaryA.score,
            issueCount: summaryB.issueCount - summaryA.issueCount,
            severity: {
                HIGH: summaryB.countsBySeverity.HIGH - summaryA.countsBySeverity.HIGH,
                MEDIUM: summaryB.countsBySeverity.MEDIUM - summaryA.countsBySeverity.MEDIUM,
                LOW: summaryB.countsBySeverity.LOW - summaryA.countsBySeverity.LOW,
            },
            category: {
                READABILITY: summaryB.countsByCategory.READABILITY - summaryA.countsByCategory.READABILITY,
                TEST_GAPS: summaryB.countsByCategory.TEST_GAPS - summaryA.countsByCategory.TEST_GAPS,
                SECURITY: summaryB.countsByCategory.SECURITY - summaryA.countsByCategory.SECURITY,
            },
        };
        const interpretation = delta.score > 0
            ? "Quality improved compared to baseline run."
            : delta.score < 0
                ? "Quality regressed compared to baseline run."
                : "No score change between compared runs.";
        res.status(200).json({
            baseline: {
                runId: runA,
                createdAt: a.createdAt.toISOString(),
                fileName: metaA.fileName,
                summary: summaryA,
            },
            candidate: {
                runId: runB,
                createdAt: b.createdAt.toISOString(),
                fileName: metaB.fileName,
                summary: summaryB,
            },
            delta,
            interpretation,
        });
    }
    catch (error) {
        console.error("Compare output booster runs error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
