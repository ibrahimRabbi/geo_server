import { RequestHandler } from "express";
import { TrideRequest } from "./ride.interface";
import { RideRequestModel } from "./ride.model";
import { catchAsync } from "../../helper/catchAsync";
import status from "http-status";
import { vehicleModel } from "../vichel/vichel.model";
import { getRoadDistanceKm } from "../../helper/getRoadDistance";
import { calculateDistanceInKm } from "../../helper/calculateDistance";
import { calculateAllVehicleDurations } from "../../helper/calculateVehicleDuration";

export const rideRequestController: RequestHandler = catchAsync(async (req, res) => {

    const totalDistance = calculateDistanceInKm(
        req.body?.pickup.latitude,
        req.body?.pickup.langitude,  
        req.body?.dropOff.latitude,
        req.body?.dropOff.langitude
    );
    const durationForEachVehicles = calculateAllVehicleDurations(totalDistance)
    const rideRequestData: Partial<TrideRequest> = {
        userId: req.user?._id,
        pickup: req.body.pickup,
        dropOff: req.body.dropOff,
        fare: 0,
        totalDistance: totalDistance,
        duration : durationForEachVehicles,
        vehicel: null,
    }

     

    const creatingRideRequest = await RideRequestModel.create(rideRequestData)
    if (!creatingRideRequest) {
        throw new Error('faild to create ride request')
    }

    res.status(status.CREATED).json({
        status: status.CREATED,
        success: true,
        message : 'ride Request created successfully',
        data : creatingRideRequest
    })
})


export const getRequestWithVehicles: RequestHandler = catchAsync(async (req, res) => {
    
    // const findMyRequest = await RideRequestModel.findOne({ userId: req.user?._id })
    const findMyRequest = await RideRequestModel.findById('6a646c229f6c2d9e9d4c1a9d')

    const getAllvechicles = await vehicleModel.find({})
    
})