export const PRODUCT_CONFIG = {
    name: "vibeship",
    coreMetrics: {
        activation: "onboarding_completed_and_first_workflow_started",
        wau: "weekly_active_users",
        freeToPaidConversion: "free_to_paid_conversion_rate",
        retention30: "thirty_day_retention",
        timeToValue: "median_time_to_first_workflow_completion",
    },
    planLimits: {
        FREE: 5,
        PREMIUM: 50,
        PRO: 1000,
    },
    featureFlags: {
        workflowLibraryEnabled: true,
        promptPacksEnabled: true,
        roadmapEngineEnabled: true,
        outputBoosterEnabled: false,
        teamFeaturesEnabled: false,
        advancedAnalyticsEnabled: false,
        pricingExperimentsEnabled: false,
    },
};
