import { Router } from "express";
import { authentication } from "../../middleware/authentication";
import { verifyTourBookingController } from "./bookingTour.controller";

export const tourOrderRoute = Router()

tourOrderRoute.post('/verify-tour-order', authentication, verifyTourBookingController)