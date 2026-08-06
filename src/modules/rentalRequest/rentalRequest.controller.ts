import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { rentalRequestServices } from "./rentalRequest.service";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";

const createRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const tenantId = req.user?.id;

    const result = await rentalRequestServices.createRentalRequestInDb(
      payload,
      tenantId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Rental Request Created Successfully",
      data: result,
    });
  },
);

// get current logged in user rental requst
const getCurrentUsersRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;

    const result =
      await rentalRequestServices.getCurrentUserAllRentalRequestFromDb(
        tenantId as string,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Yours all rental request retrived successfully",
      data: result,
    });
  },
);

//get rental request details
const getRentalRequestDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id;
    const result = await rentalRequestServices.getRentalRequestDetailsFromDb(
      id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Rental Request Details Retrived Successfull",
      data: result,
    });
  },
);



//get tenatn dashboard stats
const getTenantDashboardStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id;
    const result = await rentalRequestServices.getTenantDashboardStatsFromDb(
      id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Tenant Dashboards stats retrived successfull",
      data: result,
    });
  },
);

export const rentalRequestController = {
  createRentalRequest,
  getCurrentUsersRentalRequest,
  getRentalRequestDetails,
  getTenantDashboardStats
};
