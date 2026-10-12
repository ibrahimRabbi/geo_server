import { Router } from "express";
import {  searchFlightsController, searchPlacesController, verifyPaymentAndBookFlight } from "./flight.controller";
import { authentication } from "../../middleware/authentication";

export const flightRouter = Router();

flightRouter.post("/search-flights", searchFlightsController);
flightRouter.get("/search-places", searchPlacesController);

flightRouter.post('/verify-payment-booking-flight',authentication, verifyPaymentAndBookFlight)