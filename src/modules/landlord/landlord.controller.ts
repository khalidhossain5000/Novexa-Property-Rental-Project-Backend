import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { propertiesServices } from "./landlord.service";
import { Role } from "../../../generated/prisma/enums";

const createProperties=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

    const payload=req.body
    const categoryId=req.body.categoryId
    const landLordId=req.user?.id
    const result=await propertiesServices.createPropertiesInDb(payload,landLordId as string,categoryId)
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Properties Created Successfully",
      data: result,
    });

})
//get all properties added by current landlord

const getCurrentLandlordProperties=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

  const landLordId=req.user?.id
const role=req.user?.role

const isLandLord=role===Role.LANDLORD

    const result=await propertiesServices.getLandlordAllProperties(landLordId as string,isLandLord)
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Your all properties retrived successfully that u added",
      data: result,
    });

})



//get all rental request for landlord
const getAllRentalRequest=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

  const landLordId=req.user?.id
const role=req.user?.role

const isLandLord=role===Role.LANDLORD

    const result=await propertiesServices.getAllRentalRequestFromDb(landLordId as string,isLandLord)
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "All Rental Request For Your Properteis retirved successfull",
      data: result,
    });

})
//update rental req status accpet or reject
const updateRentalReqStatus=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

  const reqId=req.params.id
const {status}=req.body

    const result=await propertiesServices.updateRentalReqStatusInDb(reqId as string,status)
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "All Rental Request For Your Properteis retirved successfull",
      data: result,
    });

})
//update properties
const updateProperties=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

    const payload=req.body
    const propertyId=req.params.id
    const landLordId=req.user?.id
    const isLandlord=req.user?.role === Role.LANDLORD
    const result=await propertiesServices.updatePropertyInDb(payload,propertyId as string , landLordId as string,isLandlord)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Propery Updated Successfully",
      data: result,
    });

})

//delete property


const deleteProperty=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

    const propertyId=req.params.id
    const landLordId=req.user?.id
   
    const result=await propertiesServices.deletePropertyInDb(propertyId as string,landLordId as string)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Propery Deleted Successfully",
      data: result,
    });

})


//dashboard stats

const getLandlordDashboardStats=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

    
    const landLordId=req.user?.id
   
    const result=await propertiesServices.getLandlordDashboardStatsFromDb(landLordId as string)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Landlord stats retirvied sucesfull",
      data: result,
    });

})





export const propertyController={
    createProperties,
    updateProperties,
    deleteProperty,
    getAllRentalRequest,
    updateRentalReqStatus,
    getCurrentLandlordProperties,
    getLandlordDashboardStats
}