import { Router } from "express";
import { authentication } from "../../middleware/authentication";
import { findNearbyDriversController, getRequestWithVehicles, getRideRequestController, rideRequestController, selectVehicleController, updateRideRequestController } from "./ride.controller";

export const rideRequestRoute = Router()

rideRequestRoute.post('/create-request', authentication, rideRequestController)

rideRequestRoute.get('/get-my-request/:rideReqId', authentication, getRequestWithVehicles)

rideRequestRoute.patch('/select-vehicle', authentication, selectVehicleController),

rideRequestRoute.get('/find-nearby-drivers/:rideReqId', authentication, findNearbyDriversController)

rideRequestRoute.get('/get-request/:rideReqId', getRideRequestController)

rideRequestRoute.patch('/update-request/:rideReqId', updateRideRequestController)

 
