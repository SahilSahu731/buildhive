import "dotenv/config";
import passport from "passport";
import { Strategy as GitHubStrategy, } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../lib/prisma.js";
import { resolveOAuthUser } from "./oauth.js";
import { PersistedOAuthState } from "./oauth-state.js";
import { frontend } from "../hive/config.js";
const publicUrl = frontend();
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || "GITHUB_CLIENT_ID_PLACEHOLDER",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "GITHUB_CLIENT_SECRET_PLACEHOLDER",
    callbackURL: process.env.GITHUB_CALLBACK_URL ||
        `${publicUrl}/api/auth/github/callback`,
    scope: ["user:email"],
    proxy: true,
    // passport-oauth2 accepts boolean; passport-github2 has outdated typings.
    state: true,
    store: new PersistedOAuthState("github"),
}, async (accessToken, _refreshToken, profile, done) => {
    try {
        const response = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
            signal: AbortSignal.timeout(10000),
        });
        if (!response.ok)
            throw new Error("Could not verify GitHub email");
        const emails = (await response.json());
        const email = emails.find((e) => e.verified && e.primary) ||
            emails.find((e) => e.verified);
        done(null, await resolveOAuthUser({
            provider: "github",
            id: profile.id,
            email: email?.email,
            verified: !!email,
            name: profile.displayName || profile.username,
            image: profile.photos?.[0]?.value,
            githubUsername: profile.username,
            githubUrl: profile.profileUrl,
            bio: profile._json
                ?.bio,
        }));
    }
    catch (error) {
        done(error);
    }
}));
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_PLACEHOLDER",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET_PLACEHOLDER",
    callbackURL: process.env.GOOGLE_CALLBACK_URL ||
        `${publicUrl}/api/auth/google/callback`,
    proxy: true,
    state: true,
    store: new PersistedOAuthState("google"),
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        done(null, await resolveOAuthUser({
            provider: "google",
            id: profile.id,
            email: profile.emails?.[0]?.value,
            verified: profile._json.email_verified === true,
            name: profile.displayName,
            image: profile.photos?.[0]?.value,
        }));
    }
    catch (error) {
        done(error);
    }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        done(null, (await prisma.user.findUnique({ where: { id } })) || false);
    }
    catch (error) {
        done(error);
    }
});
export default passport;
