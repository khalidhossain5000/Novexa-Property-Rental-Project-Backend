//intiate payment

import axios from "axios";
import {
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
import configuration from "../../config";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status"


const createPaymentInDb = async (rentalRequestId: string, tenantId: string) => {
  // console.log(tenantId,'tenatn id from paymetn service')
  const transId = `TRNX_ID_${Date.now()}`;



  //fetch user
  const user = await prisma.user.findUniqueOrThrow({ where: { id: tenantId } });
  //payment will be done if rental request stasus is approved
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: rentalRequestId },
  });
  // checking ownership if this reuqst done by logged in user
  if (rentalRequest.tenantId !== tenantId)
    throw {
      statusCode: httpStatus.FORBIDDEN,
        name: "Forbidden",
      message: "You are not allowed to pay for this rental request.Pay your own",
    };

  //if rent req approved or not
  if (rentalRequest.status !== RentalRequestStatus.APPROVED)
    throw {
      statusCode: httpStatus.FORBIDDEN,
        name: "Forbidden",
      message:
        "Rental Request is not approved yet ,contact landlord or support",
    };
  const existingPayment = await prisma.payment.findFirst({
    where: {
      rentalRequestId,
      status: PaymentStatus.COMPLETED,
    },
  });
  if (existingPayment)
    throw {
      statusCode: httpStatus.CONFLICT,
        name: "Conflict error",
      message: "Payment has already been completed for this rental request.",
    };

  //intialied paymetn
  const paymentData = {
    store_id: configuration.ssl_commerz_store_id,
    store_passwd: configuration.ssl_commerz_store_password,
    total_amount: rentalRequest.totalAmount,
    currency: "BDT",
    tran_id: transId,
    success_url: `${configuration.app_url}/api/payments/confirm?rentalRequestId=${rentalRequestId}&tranId=${transId}&status=success`,
    fail_url: `${configuration.app_url}/api/payments/confirm?rentalRequestId=${rentalRequestId}&tranId=${transId}&status=fail`,
    cancel_url: `${configuration.app_url}/api/payments/confirm?rentalRequestId=${rentalRequestId}&tranId=${transId}&status=cancel`,
    cus_name: `${user.firstName} ${user.lastName}`,
    cus_email: user.email,
    cus_add1: "N/A",
    cus_add2: "N/A",
    cus_city: "N/A",
    cus_state: "N/A",
    cus_postcode: 1000,
    cus_country: "Bangladesh",
    // cus_phone: "01711111111",
    cus_fax: "01711111111",
  };
  //axios hittign the sslxomerz url
  const res = await axios.post(
    "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    paymentData,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );
  const data = res.data;

  await prisma.payment.create({
    data: {
      transactionId: transId,
      provider: "SSL_Commerz",
      totalAmount: rentalRequest.totalAmount,
      status: PaymentStatus.PENDING,
      rentalRequestId,
    },
  });
  return { paymentGatewayUrl: data.GatewayPageURL };
};

//payment configm and verify payment that the payment is successfully done
const verifySslCommerzPayment = async (
  transId: string,
  status: string,
  val_id: string,
) => {

  const response = await axios.post(
    `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${configuration.ssl_commerz_store_id}&store_passwd=${configuration.ssl_commerz_store_password}&format=json
`,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );

  const paymentData = response.data;

  if (paymentData.status === "VALID") {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUniqueOrThrow({
        where: {
          transactionId: transId,
        },
        include: {
          rentalRequest: true,
        },
      });

      await tx.payment.update({
        where: {
          transactionId: transId,
        },
        data: {
          status: PaymentStatus.COMPLETED,
        },
      });

      await tx.rentalRequest.update({
        where: {
          id: payment.rentalRequestId,
        },
        data: {
          status: RentalRequestStatus.ACTIVE,
        },
      });

      //set property stasus to booked

      await tx.properties.update({
        where: {
          id: payment.rentalRequest.propertyId,
        },
        data: {
          status: PropertyStatus.BOOKED,
        },
      });
    });
  } else if (
    paymentData.status === "FAILED" ||
    paymentData.status === "INVALID_TRANSACTION"
  ) {
    await prisma.payment.update({
      where: {
        transactionId: transId,
      },
      data: {
        status: PaymentStatus.FAILED,
      },
    });
  }

  return status;
};

//get  users payment history
const paymentHistoryFromDb = async (tenantId: string) => {
  const result = await prisma.payment.findMany({
    where: {
      rentalRequest: {
        tenantId,
      },
    },
    include: {
      rentalRequest: {
        include:{
          property:true
        }
      },

    },
  });
  console.log(result,'this is result')
  return result;
};

//get payment details
const paymentDetailsFromDb = async (id: string, tenantId: string) => {
  const result = await prisma.payment.findUniqueOrThrow({
    where: {
      id,
      rentalRequest: {
        tenantId,
      },
    },
    include: {
      rentalRequest: true,
    },
  });
  return result;
};

export const paymentServices = {
  createPaymentInDb,
  verifySslCommerzPayment,
  paymentHistoryFromDb,
  paymentDetailsFromDb,
};
