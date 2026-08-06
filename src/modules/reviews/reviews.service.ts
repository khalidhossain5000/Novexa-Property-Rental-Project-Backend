import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IReviews } from "./reviews.interface";
import httpStatus from "http-status";

const createReviewsInDb = async (payload: IReviews, tenantId: string) => {
  const { rating, content, propertyId } = payload;
  const convertedRating = Number(rating);
  //rating validation between 1 to 5
  if (convertedRating < 1 || convertedRating > 5)
    throw {
      statusCode: 409,
      message: "Invalid rating",
    };

  //check if property exist
  const property = await prisma.properties.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property)
    throw {
      statusCode: httpStatus.NOT_FOUND,
      name: "Not found",
      message: "property not found",
    };

  //need to check if the payment is done and rental is completed
  const completedRental = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      status: RentalRequestStatus.ACTIVE,
    },
  });
  if (!completedRental)
    throw {
      statusCode: httpStatus.FORBIDDEN,
      name: "Forbidden",
      message: "Payment not completed yet pay first",
    };

  //check duplicate review

  const existingReview = await prisma.reviews.findFirst({
    where: {
      tenantId,
      propertyId,
    },
  });

  if (existingReview)
    throw {
      statusCode: httpStatus.CONFLICT,
      name: "CONFLICT",
      message: "You already given review for this rent",
    };

  //now here we can create review

  const review = await prisma.reviews.create({
    data: {
      rating: convertedRating,
      content,
      propertyId,
      tenantId,
    },
    include: {
      property: true,
      tenant: {
        omit: {
          password: true,
        },
      },
    },
  });
  return review;
};

export const reviewsServices = {
  createReviewsInDb,
};
