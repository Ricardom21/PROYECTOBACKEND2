import { usersModel } from "../models/index.js";

// Clase para controlar los métodos referentes a los usuarios.
class UserManager {
  constructor(model) {
    this.productsArray = [];
    this.path = `./../jsons/product.json`;
    this.getting = false;
    this.model = model;
  }
  isRegistered = (focusRoute, returnObject, req, res) => {
    return req.session.user
      ? res.render(focusRoute, returnObject)
      : res.redirect("/login");
  };
  findUser = async (emailValue) => {
    let myUser = await usersModel.findOne({ email: emailValue }).lean();
    return myUser;
  };
  addUser = async (user) => {
    const dbUser = await this.model.create({ ...user });
    return dbUser;
  };
};

// Métodos a utilizar:
// isRegistered (focusRoute, returnObject, req, res)
// findUser (emailValue)
// addUser (user)

const UserMDBManager = new UserManager(usersModel);

export default UserMDBManager;
