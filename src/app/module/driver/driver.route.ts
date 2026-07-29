import { Router } from "express";
import { placeFile } from "../../helper/fileParser";
import { createDriverController, driverSignInController, getDriverProfileController, singleImageUploadController, tempDriverController, updateDriverLocationController } from "./driver.controller";
import { authentication } from "../../middleware/authentication";

export const driverRoute = Router()

driverRoute.post('/upload-image', placeFile.single('document'), singleImageUploadController)
driverRoute.post('/temp-driver', tempDriverController)
driverRoute.post('/create-driver', createDriverController)
driverRoute.post('/sign-in-driver', driverSignInController),
driverRoute.get('/driver-profile', authentication, getDriverProfileController)
driverRoute.patch('/update-location', authentication, updateDriverLocationController)