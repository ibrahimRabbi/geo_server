import { Router } from "express";
import { paymentCheckOutSessionController, searchFlightsController, searchPlacesController, verifyPaymentAndBookFlight } from "./flight.controller";

export const flightRouter = Router();

flightRouter.post("/search-flights", searchFlightsController);
flightRouter.get("/search-places", searchPlacesController);
flightRouter.post("/create-checkout-session", paymentCheckOutSessionController)
flightRouter.post('/verify-payment-booking-flight', verifyPaymentAndBookFlight)