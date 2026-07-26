import { RequestHandler } from "express";
import { TrideRequest } from "./ride.interface";
import { RideRequestModel } from "./ride.model";
import { catchAsync } from "../../helper/catchAsync";
import status from "http-status";
import { vehicleModel } from "../vichel/vichel.model";
import { calculateDistanceInKm } from "../../helper/calculateDistance";


export const rideRequestController: RequestHandler = catchAsync(async (req, res) => {

    const totalDistance = calculateDistanceInKm(
        req.body?.pickup.latitude,
        req.body?.pickup.langitude,
        req.body?.dropOff.latitude,
        req.body?.dropOff.langitude
    );

    const rideRequestData: Partial<TrideRequest> = {
        userId: req.user?._id,
        pickup: req.body.pickup,
        dropOff: req.body.dropOff,
        fare: 0,
        totalDistanceKm: totalDistance,
        vehicel: null,
    }



    const creatingRideRequest = await RideRequestModel.create(rideRequestData)
    if (!creatingRideRequest) {
        throw new Error('faild to create ride request')
    }

    res.status(status.CREATED).json({
        status: status.CREATED,
        success: true,
        message: 'ride Request created successfully',
        data: creatingRideRequest
    })
})

export const getRequestWithVehicles: RequestHandler = catchAsync(async (req, res) => {

    const findMyRequest = await RideRequestModel.findOne({ userId: req.user?._id })
    if (!findMyRequest) {
        throw new Error('faild to retrive your request')
    }

    const getAllvechicles = await vehicleModel.find({}).lean()

    const finalVehicleList = getAllvechicles.map((vehicle: any) => {

        //duration calculation
        const bufferMinute = 2
        const calculateDuration = (findMyRequest?.totalDistanceKm / vehicle?.avrSpeedPerKm) * 60;
        const final_duration = Math.ceil(calculateDuration) + bufferMinute;

        //fare calculation
        const estimatedFare = vehicle.baseFare + (findMyRequest?.totalDistanceKm * vehicle.perKmRate) + (final_duration * vehicle.perMinRate)

        return { ...vehicle, fare: estimatedFare, duration: final_duration }
    })

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'vehicle and ride reqest data retrived successfully',
        data: {
            vehicles: finalVehicleList,
            rideRequest: findMyRequest
        }
    })




})


export const selectVehicleController: RequestHandler = catchAsync(async (req, res) => {
     
    const updateFiled: Partial<TrideRequest> = {
        paymentType: req.body?.paymentType,
        fare: req.body?.fare,
        vehicel: req?.body?.vehicleId,
    }

    const updating = await RideRequestModel.findByIdAndUpdate(req?.body?.rideReqId, updateFiled,
        { new: true, runValidators: true, context: 'query', strict: true, })
    
    if (!updating) {
        throw new Error('faild to update request')
    }

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'ride reqest updated successfully',
        data : updating
    })
})