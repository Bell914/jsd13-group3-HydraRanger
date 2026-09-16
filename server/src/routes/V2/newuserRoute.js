import express from "express";
import {
  loginUser,
  registerUser,
} from "../../controllers/newUserController.js";

const newUserRouter = express.Router();

newUserRouter.post("/register", registerUser);
newUserRouter.post("/login", loginUser);

export default newUserRouter;
