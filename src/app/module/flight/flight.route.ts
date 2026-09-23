import { Router } from "express";
import { searchFlightsController, searchPlacesController } from "./flight.controller";

export const flightRouter = Router();

flightRouter.post("/search-flights", searchFlightsController);
flightRouter.get("/search-places", searchPlacesController);