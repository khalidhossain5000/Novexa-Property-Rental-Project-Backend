import { Router } from "express";
import { propertyController } from "./landlord.controller";
import auth from "../../middleware/auth.middleware";
import { Role } from "../../../generated/prisma/enums";

const router=Router()
//create properteis by landlord
router.post("/properties",auth(Role.LANDLORD),propertyController.createProperties)
//get current logged in landlord properties
router.get("/properties/my-properties",auth(Role.LANDLORD),propertyController.getCurrentLandlordProperties)
//dashboard stats
router.get("/dashboard/stats",auth(Role.LANDLORD),propertyController.getLandlordDashboardStats)
//get all rental request for landlord manageemnt
router.get("/properties/requests",auth(Role.LANDLORD),propertyController.getAllRentalRequest)
//update rental request accpet or reject
router.patch("/properties/requests/:id",auth(Role.LANDLORD),propertyController.updateRentalReqStatus)

//update property by landlord
router.put("/properties/:id",auth(Role.LANDLORD),propertyController.updateProperties)
//delete property by landlord
router.delete("/properties/:id",auth(Role.LANDLORD),propertyController.deleteProperty)
export const landLordRoutes=router