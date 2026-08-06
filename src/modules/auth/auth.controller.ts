import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { authServices } from "./auth.service";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await authServices.createUserInDb(payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User Registered Successfull",
      data: result,
    });


  },
);



//login user
const loginUser=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
const {email,password}=req.body;
const result=await authServices.loginUserInDb(email,password)

const {accessToken , refreshToken}  = result
//store token in cookie 

res.cookie("accessToken",accessToken,{
    httpOnly:true,
    sameSite:"none",
    secure:false,
    maxAge:1000 * 60 *60 *24 *10
})

res.cookie("refreshToken",refreshToken,{
    httpOnly:true,
    sameSite:"none",
    secure:false,
    maxAge:1000 * 60 *60 *24 *1
})


  sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User Login Successfull",
      data: result,
    });

})


//get me 

const getMe=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
   const id=req.user?.id as string
    const result=await authServices.getCurrentUserFromDb(id)
      sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Current User Data Retrived Successfull",
      data: result,
    });
})


const updateUser=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
   const id=req.user?.id as string
   const payload=req.body
   console.log(payload,'this is payload')
    const result=await authServices.updateUserProfile(id as string,payload)
      sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User profile updated successfulll",
      data: result,
    });
})








//validating refreshtoken and generating accesstoken

const refreshUserToken=catchAsync(async(req:Request,res:Response)=>{
    const refreshToken=req.cookies.refreshToken
    const accessToken=await authServices.refreshToken(refreshToken)
    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        sameSite:"none",
        secure:false,
        maxAge:1000 * 60 *60 *24 *1.5
    })
    sendResponse(res,{
        statusCode:httpStatus.CREATED,
        success:true,
        message:"Token refresh successfully and new token given",
        data:accessToken
    })
})

export const authController = {
  registerUser,
  loginUser,
  refreshUserToken,
  getMe,
  updateUser
};
