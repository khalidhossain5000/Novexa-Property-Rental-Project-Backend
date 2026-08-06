

import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { adminServices } from "./admin.service";
const getAllUsers=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
   const result=await adminServices.getAllUsersFromDb()
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "All Rental Request For Your Properteis retirved successfull",
      data: result,
    });

})

//update user status
const updateUserStatus=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
   const status=req.body.status
   const userId=req.params?.id
   const result=await adminServices.updateUserStatus(status,userId as string)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Status updated successfull",
      data: result,
    });

})

//get all properties for admin manage
const getAllProperties=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
   const result=await adminServices.getAllPropertiesFromDb()
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "All Rental Request For Your Properteis retirved successfull",
      data: result,
    });

})

//get all rental request from db for admin manager
const getAllRentalRequest=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
   const result=await adminServices.getAllRentalRequestFromDb()
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "All Rental Request For Your Properteis retirved successfull",
      data: result,
    });

})

//get all properties for admin manage
const getAdminStats=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
   const result=await adminServices.getAdminDashboardStatsFromDb()
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin dashboard stats",
      data: result,
    });

})
export const adminController={
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentalRequest,
    getAdminStats
}