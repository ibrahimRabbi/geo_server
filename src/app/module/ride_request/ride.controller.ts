import { RequestHandler } from "express";
import { TrideRequest } from "./ride.interface";
import { RideRequestModel } from "./ride.model";
import { catchAsync } from "../../helper/catchAsync";
import status from "http-status";
import { vehicleModel } from "../vichel/vichel.model";
import { calculateDistanceInKm } from "../../helper/calculateDistance";
import { drivermodel } from "../driver/driver.model";
import { getIO, registerPendingOffer, resolvePendingOffer } from "../../socket";
 
 
 


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
        vehicle: null,
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

    const findMyRequest = await RideRequestModel.findById(req.params?.rideReqId).lean()
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
        vehicle: req?.body?.vehicleId,
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
        data: updating
    })
})


export const findNearbyDriversController: RequestHandler = catchAsync(async (req, res) => {

    const maxDistanceInMeters = 5000;
    const maxTimeOut = 15000;
    const myRideRequest = await RideRequestModel.findById(req.params?.rideReqId)
        .populate('vehicle', 'model plateNumber')
        .populate('userId')
        .lean()
    

    if (!myRideRequest) {
        throw new Error('failed to retrieve your request')
    }

    const nearbyDrivers = await drivermodel.find({
        isActive: true,
        status: 'approved',
        // 'vehicleInfo.vehicleType': myRideRequest.vehicle?.vehicle_name,
        currentLocation: {
            $nearSphere: {
                $geometry: {
                    type: 'Point',
                    coordinates: [myRideRequest.pickup.langitude, myRideRequest.pickup.latitude],
                },
                $maxDistance: maxDistanceInMeters,
            },
        },
    }).lean();
    

     
    if (!nearbyDrivers.length) {
        return res.status(status.OK).json({
            status: status.OK,
            success: true,
            message: 'no nearby drivers found',
            data: null,
        });
    }

    const offerRide = {
        rideRequestId: myRideRequest._id.toString(),
        rider : myRideRequest.userId,
        pickup: myRideRequest.pickup?.address,
        dropOff: myRideRequest.dropOff?.address,
        fare: myRideRequest.fare,
        totalDistanceKm: myRideRequest.totalDistanceKm,
    }
    //working well from this point




    const offerRideToDriver = (driverId: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolvePendingOffer(offerRide.rideRequestId, driverId, false);
            }, maxTimeOut);

            registerPendingOffer(offerRide.rideRequestId, driverId, (accepted) => {
                clearTimeout(timeout);
                resolve(accepted);
            });

            getIO().to(driverId).emit('ride:offer', offerRide);
        });
    };

    let matchedDriver: (typeof nearbyDrivers)[number] | null = null;

    for (const driver of nearbyDrivers) {
        // const currentRequest = await RideRequestModel.findById(myRideRequest._id).select('status').lean();
        // if (!currentRequest || currentRequest.status !== 'pending') {
        //     break;  
        // }

        const accepted = await offerRideToDriver(driver._id.toString());

        if (accepted) {
            matchedDriver = driver;
            break;
        }
    }

    if (!matchedDriver) {
        await RideRequestModel.findByIdAndUpdate(myRideRequest._id, { status: 'no_driver_found' });

        return res.status(status.OK).json({
            status: status.OK,
            success: true,
            message: 'no driver accepted the ride request',
            data: null,
        });
    }

    const updatedRideRequest = await RideRequestModel.findByIdAndUpdate(
        myRideRequest._id,
        { status: 'accepted', driverId: matchedDriver._id },
        { new: true }
    );

    await drivermodel.findByIdAndUpdate(matchedDriver._id, { isActive: false });

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'driver found and assigned successfully',
        data:  updatedRideRequest,
    });

})


export const getRideRequestController: RequestHandler = catchAsync(async (req, res) => {

    const findRideRequest = await RideRequestModel.findById(req.params?.rideReqId).populate('vehicle').populate('userId').populate('driverId')
    if (!findRideRequest) {
        throw new Error('faild to get rideRequest')
    }
     
    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'ride request data retrived successfully',
        data: findRideRequest,
    });

})

export const updateRideRequestController: RequestHandler = catchAsync(async (req, res) => {

    const updateRideRequest = await RideRequestModel.findByIdAndUpdate(req.params?.rideReqId, req.body, { new: true, runValidators: true, context: 'query', strict: true })
    if (!updateRideRequest) {
        throw new Error('faild to update rideRequest')
    }
    
    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'ride request data updated successfully',
        data: updateRideRequest,
    });

})

 

    
    
 