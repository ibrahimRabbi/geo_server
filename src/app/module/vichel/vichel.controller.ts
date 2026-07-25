import { RequestHandler } from "express";
import { catchAsync } from "../../helper/catchAsync";
import { vehicleModel } from "./vichel.model";
import status from "http-status";


export const getAllvehicles = catchAsync(async(req, res) => {
   
    const vehicles = await vehicleModel.find();
    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'All vehicles retrieved successfully',
        data: vehicles
    });

})