import { Router } from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth.middleware";
import { Role } from "../../../generated/prisma/enums";
const router=Router()
//register user
router.post("/register",authController.registerUser)
//login
router.post("/login",authController.loginUser)
//get me 
router.get("/me",auth(Role.TENANT,Role.LANDLORD,Role.ADMIN),authController.getMe)
//refresh token
router.post("/refresh-token",authController.refreshUserToken)
export const authRoutes=router