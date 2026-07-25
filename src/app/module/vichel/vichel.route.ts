import { Router } from "express";
import { getAllvehicles } from "./vichel.controller";

export const vehicleRoutes = Router();

vehicleRoutes.get('/get-all-vehicles', getAllvehicles)