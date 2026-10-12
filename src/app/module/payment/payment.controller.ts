import { RequestHandler } from "express";
import { catchAsync } from "../../helper/catchAsync";
 
import status from "http-status";
import { createCheckoutSessionService } from "./payment.services";

export const paymentCheckOutSessionController: RequestHandler = catchAsync(async (req, res) => {

    const result = await createCheckoutSessionService(req?.body)

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: "Checkout session created successfully",
        data: result,
    });
})