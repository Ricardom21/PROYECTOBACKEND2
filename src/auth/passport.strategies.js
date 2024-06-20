import passport from "passport";
import local from "passport-local";
import { UserMDBManager } from "../dao/index.js";
import { isValidPassword, createHash } from "../utils.js";

const localStrategy = local.Strategy;

const initAuthStrategies = () => {
  passport.use(
    "login",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          let myUser = await UserMDBManager.findUser(username);
          const validation = isValidPassword(myUser, password);
          if (myUser && validation) {
            return done(null, myUser);
          } else {
            return done("Error 401: Datos de acceso no válidos.", false);
          }
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
  passport.use(
    "register",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          let user = await UserMDBManager.findUser(username);
          if (user) {
            return done(null, false);
          }
          const newUser = { ...req.body, password: createHash(password) };
          let result = await UserMDBManager.addUser(newUser);
          return done(null, newUser);
        } catch (error) {
          return done("Error:" + error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

export default initAuthStrategies;
