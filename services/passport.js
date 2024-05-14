const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");

passport.use(
  new GoogleStrategy(
    {
      //options for the google strategy
      callbackURL: "/api/user/google/redirect",
      clientID:
        "967892919084-ift5ign6e04j2l3u1lfniopichc5lgu5.apps.googleusercontent.com",
      clientSecret: "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",
    },
    (req, token, refreshToken, profile, done) => {
      //passport callback function

      if (true) {
        return done(null, profile);
      } else {
        return done();
      }
    }
  )
);
