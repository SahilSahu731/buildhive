import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from '../lib/prisma.js';
import dotenv from 'dotenv';
dotenv.config();
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'GITHUB_CLIENT_ID_PLACEHOLDER',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'GITHUB_CLIENT_SECRET_PLACEHOLDER',
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email'],
    proxy: true,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { id, username, profileUrl, photos, emails, _json } = profile;
        const email = emails?.[0]?.value;
        const avatar = photos?.[0]?.value;
        const bio = _json?.bio;
        // check if user exists by githubId
        let user = await prisma.user.findUnique({
            where: { githubId: id },
        });
        if (user) {
            return done(null, user);
        }
        // check if user already exists with email
        if (email) {
            user = await prisma.user.findUnique({
                where: { email },
            });
            if (user) {
                // link account
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        githubId: id,
                        githubUsername: username,
                        githubUrl: profileUrl,
                        // Only update image if not set
                        image: user.image ? undefined : avatar,
                    },
                });
                return done(null, user);
            }
        }
        // Create new user
        // Note: Email is required field in schema. If GitHub doesn't provide email (private), we might have issues.
        // Usually GitHub provides a noreply email if private, or we fail.
        if (!email) {
            return done(new Error("Email is required from GitHub"), undefined);
        }
        user = await prisma.user.create({
            data: {
                githubId: id,
                githubUsername: username,
                email: email,
                name: profile.displayName || username,
                image: avatar,
                githubUrl: profileUrl,
                bio: bio,
                emailVerified: true,
            },
        });
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_PLACEHOLDER',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `${SERVER_URL}/api/auth/google/callback`,
    proxy: true,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { id, displayName, emails, photos } = profile;
        const email = emails?.[0]?.value;
        const avatar = photos?.[0]?.value;
        // check if user exists by googleId
        let user = await prisma.user.findUnique({
            where: { googleId: id },
        });
        if (user) {
            return done(null, user);
        }
        // check if user already exists with email
        if (email) {
            user = await prisma.user.findUnique({
                where: { email },
            });
            if (user) {
                // link account
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        googleId: id,
                        // Only update image if not set
                        image: user.image ? undefined : avatar,
                    },
                });
                return done(null, user);
            }
        }
        if (!email) {
            return done(new Error("Email is required from Google"), undefined);
        }
        // Create new user
        user = await prisma.user.create({
            data: {
                googleId: id,
                email: email,
                name: displayName,
                image: avatar,
                emailVerified: true,
            },
        });
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
// Serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
export default passport;
