import { Router } from "express";
import { getAllTourPackages, getSingleTourPackages } from "./tour.controller";

export const tourRoute = Router()

tourRoute.get('/get-all-package', getAllTourPackages)
tourRoute.get('/get-package/:id', getSingleTourPackages)