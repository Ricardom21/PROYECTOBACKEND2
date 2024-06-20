import passport from "passport";
import config from "../config.js";
import initAuthStrategies from "../auth/passport.strategies.js";
import { Router } from "express";
import { UserMDBManager } from "../dao/index.js";
import { isValidPassword } from "../utils.js";
import { createHash, verifyRequiredBody } from "../utils.js";
const router = Router();
const adminAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role != "admin")
    return res
      .status(401)
      .send({ origin: config.SERVER, payload: "Usuario no autorizado." });
  next();
};
initAuthStrategies();

router.get("/session", async (req, res) => {
  try {
    if (req.session.counter) {
      req.session.counter++;
      res.status(200).send({
        origin: config.SERVER,
        payload: `${req.session.counter} visualizaciones!`,
      });
    } else {
      req.session.counter = 1;
      res.status(200).send({
        origin: config.SERVER,
        payload: `Bienvenido! Eres la primera visualización.`,
      });
    }
  } catch {
    res.send({
      origin: config.SERVER,
      payload: null,
      error: "Error de sessions.",
    });
  }
});
router.post("/login", verifyRequiredBody(["email", "password"]), async (req, res) => {
    try {
      const { email, password } = req.body;
      let myUser = await UserMDBManager.findUser(email);
      const validation = isValidPassword(myUser, password);
      if (myUser && validation) {
        req.session.user = { ...myUser };
        res.redirect("/products");
      } else {
        res.status(401).send("Datos de acceso no válidos.");
      }
    } catch {
      res.status(500).send("Session error.");
    }
  }
);
router.post("/register", verifyRequiredBody([ "name", "lastName", "password", "email", "phoneNumber", "description", "age" ]), async (req, res) => {
    try {
      let dbUser = await UserMDBManager.findUser(req.body.email);
      let myUser = req.body;
      if (dbUser) {
        return res
          .status(500)
          .send("El correo y/o la contraseña ya están ocupados.");
      }
      req.session.user = { ...myUser, password: createHash(myUser.password) };
      let dbUser2 = await UserMDBManager.addUser({
        ...myUser,
        password: createHash(myUser.password),
      });
      req.session.user.role = dbUser2.role;
      res.redirect("/products");
    } catch {
      res.status(500).send("Session error.");
    }
  }
);
router.post("/pplogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", { failureRedirect: `/pplogin?error=${encodeURI("Usuario y/o clave no válidos.")}` }), async (req, res) => {  
  try {
      req.session.user = req.user;
      req.session.save((error) => {
        if (error)
          return res
            .status(500)
            .send({
              origin: config.SERVER,
              payload: null,
              error: "Error almacenando datos de sesión.",
            });
        res.redirect("/products");
      });
    } catch (error) {
      res.status(500).send("Session error");
    }
  }
);
router.post("/ppregister", verifyRequiredBody([ "name", "lastName", "password", "email", "phoneNumber", "description", "age"]), passport.authenticate("register", { failureRedirect: `/ppregister?error=${encodeURI("Email y/o contraseña no válidos.")}`}), async (req, res) => {
    try {
      req.session.user = req.user;
      let dbUser2 = await UserMDBManager.addUser(req.user);
      req.session.user.role = dbUser2.role;
      res.redirect("/products");
    } catch {
      res.status(500).send("Session error.");
    }
  }
);
router.get("/private", adminAuth, async (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else if (req.session.user.role == "admin") {
    try {
      res.status(200).send("Bienvenido, admin.");
    } catch {
      res.status(500).send("Session error.");
    }
  } else {
    try {
      res.status(401).send("Acceso no autorizado.");
    } catch {
      res.status(500).send("Session error.");
    }
  }
});
router.get("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err)
        return res.status(500).send({
          origin: config.SERVER,
          payload: "Error al ejecutar logout.",
        });
      res.redirect("/login");
    });
  } catch {
    res.status(200).send({
      origin: config.SERVER,
      payload: null,
      error: "Error de sesión.",
    });
  }
});
export default router;
