import { Router } from "express";
import { authentication } from "../../middleware/authentication";
import { getRequestWithVehicles, rideRequestController } from "./ride.controller";

export const rideReqestRoute = Router()

rideReqestRoute.post('/create-request', authentication, rideRequestController)

rideReqestRoute.get('/get-my-request', getRequestWithVehicles)