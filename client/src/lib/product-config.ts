export const PRODUCT_CONFIG = {
  name: "vibeship",
  promise: "Vibe code faster. Ship cleaner. Learn what actually works.",
  targetUsers: [
    "solo developers",
    "students",
    "small product teams",
  ],
  plans: {
    FREE: {
      dailyWorkflowActions: 5,
      workflowLibrary: "starter",
      promptPacks: "basic",
    },
    PREMIUM: {
      dailyWorkflowActions: 50,
      workflowLibrary: "full",
      promptPacks: "advanced",
    },
    PRO: {
      dailyWorkflowActions: 1000,
      workflowLibrary: "full",
      promptPacks: "advanced",
    },
  },
  featureFlags: {
    workflowLibraryEnabled: true,
    promptPacksEnabled: true,
    roadmapEngineEnabled: true,
    outputBoosterEnabled: true,
    teamFeaturesEnabled: false,
    advancedAnalyticsEnabled: false,
    pricingExperimentsEnabled: false,
  },
} as const;
