import { Router } from "express";
import { getRiderProfileController, signInController } from "./ride.controller";
import { authentication } from "../../middleware/authentication";

export const riderRoute = Router()

riderRoute.post('/sign-in', signInController)
riderRoute.get('/get-rider-profile', authentication, getRiderProfileController)

