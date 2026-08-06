import { Router } from "express";
import auth from "../../middleware/auth.middleware";
import { Role } from "../../../generated/prisma/enums";
import { rentalRequestController } from "./rentalRequest.controller";

const router=Router()
//create rental request
router.post("/",auth(Role.TENANT),rentalRequestController.createRentalRequest)
//get current login user all rental request
router.get("/",auth(Role.TENANT),rentalRequestController.getCurrentUsersRentalRequest)
//tenant dashbaord stats
router.get("/tenant/dashboard/stats",auth(Role.TENANT),rentalRequestController.getTenantDashboardStats)
//get rental request details
router.get("/:id",auth(Role.TENANT),rentalRequestController.getRentalRequestDetails)
export const rentalRequestRoutes=router