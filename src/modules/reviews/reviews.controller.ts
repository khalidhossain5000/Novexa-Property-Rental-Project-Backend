import { Request ,Response, NextFunction} from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { reviewsServices } from "./reviews.service";
const createReviews=catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

const payload=req.body
const tenantId=req.user?.id


const result=await reviewsServices.createReviewsInDb(payload,tenantId as string)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews created successfully",
      data: result,
    });
  },
);

export const reviewsController={
    createReviews
}