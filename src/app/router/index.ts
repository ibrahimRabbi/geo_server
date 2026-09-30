import { Router } from "express";
import { vehicleRoutes } from "../module/vichel/vichel.route";
import { riderRoute } from "../module/rider/ride.route";
import { rideRequestRoute } from "../module/ride_request/rider.route";
import { driverRoute } from "../module/driver/driver.route";
import { flightRouter } from "../module/flight/flight.route";
import { tourRoute } from "../module/tour/tour.route";

export const router = Router()

router.use('/vehicles', vehicleRoutes)
router.use('/rider', riderRoute)
router.use('/ride-request', rideRequestRoute)
router.use('/driver', driverRoute)
router.use('/flight', flightRouter)
router.use('/tour', tourRoute)





router.get('/', (req, res) => {
    res.json({ title: 'this is server entry point' })
})



