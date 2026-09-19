# How Passport.js Google OAuth Works in RentNest

This document breaks down exactly how Passport.js is integrated into your backend to handle Google authentication seamlessly without you having to manually manage authorization codes or external API calls.

## 1. Initialization and Setup (`src/app.ts`)

Before Passport can do anything, it needs to be integrated into your Express application. In your `app.ts`, you have:

```typescript
app.use(passport.initialize());
app.use(passport.session());
```

This attaches Passport to your Express server. It ensures that whenever a request comes in, Passport has the opportunity to populate `req.user` if an authentication flow is completed.

## 2. The Google Strategy (`src/config/passport.ts`)

Passport uses "Strategies" to know how to authenticate with different providers. You've configured the `GoogleStrategy`:

```typescript
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id,
      clientSecret: config.google_client_secret,
      callbackURL: config.google_callback_url,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Passes the Google profile downstream to your controller
      return done(null, profile as any);
    }
  )
);
```

**What this does:**
1. Tells Passport the credentials it needs to communicate with Google.
2. Defines a "Verify Callback". When Google successfully authenticates a user, it sends the user's information back to this callback.
3. You simply pass the raw Google `profile` object to `done()`, which tells Passport: *"Authentication successful, attach this profile to `req.user`"*.

## 3. Triggering the Login (`src/modules/auth/auth.routes.ts`)

When a user clicks "Login with Google" on your frontend, they are sent to this route:

```typescript
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
```

**What this does:**
The `passport.authenticate` middleware intercepts the request. It dynamically generates a special Google URL containing your `clientID` and the `scope` (asking for profile and email permissions) and performs an HTTP redirect (302) to send the user to the Google Consent Screen.

## 4. The Google Callback 

After the user clicks "Allow" on Google's consent screen, Google redirects them back to your backend at your `callbackURL` (e.g., `/api/auth/google/callback`), appending an authorization code to the URL: `?code=4%2F0AXEQ...`

Your callback route handles this:

```typescript
router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }), 
    authController.googleAuthCallback
);
```

**The Magic of Passport Middleware:**
This is where Passport shines. The `passport.authenticate("google")` middleware sitting on this route sees the `?code=` in the URL and automatically does the following:
1. Extracts the `code`.
2. Makes a secure server-to-server HTTP request to Google to exchange the `code` for an `access_token`.
3. Makes *another* request to Google's UserInfo API using that `access_token` to fetch the user's email and name.
4. Triggers the Verify Callback in your Strategy (from Step 2), passing in the fetched `profile`.
5. Takes the profile returned from `done(null, profile)` and attaches it to `req.user`.
6. Calls `next()`, passing execution to your `authController.googleAuthCallback`.

## 5. Your Custom Logic (`src/modules/auth/auth.service.ts`)

Now that Passport has done the heavy lifting, your custom business logic takes over. 

```typescript
const { accessToken, refreshToken, role } = await authService.googleLogin(req.user);
```

Inside `googleLogin`:
1. It extracts the email and name from the Google `profile` passed in `req.user`.
2. It checks if the user exists in your database via Prisma.
3. **If new:** It creates a new user in the database, assigning them a dummy hashed password and the default `"TENANT"` role.
4. **If existing:** It ensures they aren't blocked.
5. Finally, it generates your system's own JWT `accessToken` and `refreshToken` and returns them along with the user's `role`.

## 6. Finishing Up and Redirecting (`src/modules/auth/auth.controller.ts`)

The controller takes the JWTs and the role returned by your service and issues cookies to the browser. 

```typescript
// Setting secure HttpOnly cookies
res.cookie("accessToken", accessToken, { ... });
res.cookie("refreshToken", refreshToken, { ... });

// Dynamic redirect based on role
const redirectMap: Record<string, string> = {
    ADMIN: "dashboard/admin",
    LANDLORD: "dashboard/landlord",
    TENANT: "dashboard/tenant"
};
res.redirect(`${process.env.APP_URL}/${redirectMap[role] || "dashboard/tenant"}`);
```

At this point, the backend redirects the browser *back* to the frontend (e.g., `http://localhost:3000/dashboard/tenant`), carrying the securely embedded HTTP cookies. The frontend can now make authenticated API requests using those cookies!
