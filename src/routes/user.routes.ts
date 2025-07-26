import { Router } from "express";
import {
    deleteUser,
    getAllUsers,
    getUser,
    saveUser,
    updateUser,
    searchUser
} from "../controller/user.controller";

const userRouter: Router = Router();


userRouter.get("/get-all-users", getAllUsers);
userRouter.get("/search-u", searchUser);
userRouter.get("/:id", getUser);
userRouter.post("/save-user", saveUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;