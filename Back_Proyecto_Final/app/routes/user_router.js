import express from "express";
import userController from "../controller/user_controller.js";
import validateLoginDto from "../utils/validate_login_dto.js";
const userRouter = express.Router();

//Registro de nuevo usuario
userRouter.post("/signUpAlumno", userController.addAlumno);
//Registro de nueva empresa
userRouter.post("/signUpEmpresa", userController.addEmpresa);
//Registro de nuevo admin
userRouter.post("/signUpAdmin", userController.addAdmin);
//Modificar alumno
userRouter.patch("/updateUser", userController.updateUser);
// //Login de un usuario
// userRouter.post("/login", validateLoginDto, userController.loginUser);
// //Eliminar un usuario
// userRouter.delete("/deleteUser", userController.deleteUser);

export default userRouter;
