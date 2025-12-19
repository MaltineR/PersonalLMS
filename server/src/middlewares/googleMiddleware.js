const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/UserModel'); 

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
   throw new Error('JWT_SECRET is not defined in environment variables');
}

// Only enable Google OAuth if credentials are provided
if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                callbackURL: process.env.NODE_ENV === "production"
                    ? "https://your-backend.onrender.com/api/v1/auth/google/callback"
                    : "http://localhost:3000/api/v1/auth/google/callback",
                scope: ["profile", "email"]
            },
            async function (_accessToken, _refreshToken, profile, callback) {
                try {
                    const googleEmail = profile.emails?.[0].value;
                    const googleName = profile.displayName || profile.name?.givenName || 'Google User';
                    let googleAvatar = profile.photos?.[0]?.value || "https://www.gstatic.com/images/branding/searchlogo/ico/favicon.ico";

                    if (!googleEmail) throw new Error("No email provided from Google");

                    let user = await User.findOne({ email: googleEmail });

                    if (user) {
                        if (user.avatar !== googleAvatar) {
                            user.avatar = googleAvatar;
                            await user.save();
                        }
                    } else {
                        user = new User({
                            name: googleName,
                            email: googleEmail,
                            avatar: googleAvatar,
                            password: 'google-oauth',
                            authProvider: 'google',
                            googleId: profile.id
                        });
                        await user.save();
                    }

                    const token = jwt.sign(
                        { userId: user._id, email: user.email, avatar: user.avatar }, 
                        String(JWT_SECRET),
                        { expiresIn: "3h" }
                    );

                    callback(null, { ...user.toObject(), token });
                } catch (error) {
                    console.error("Error in Google Strategy:", error);
                    callback(error);
                }
            }
        )
    );

    console.log(" Google OAuth enabled");
} else {
    console.log(" Google OAuth disabled (no CLIENT_ID/CLIENT_SECRET)");
}


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
