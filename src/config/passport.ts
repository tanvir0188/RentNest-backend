import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "./index";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id,
      clientSecret: config.google_client_secret,
      callbackURL: config.google_callback_url,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // We will handle user creation in the service layer when the callback hits.
        // For now, just pass the profile through.
        return done(null, profile as any);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
