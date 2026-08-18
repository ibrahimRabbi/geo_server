import { Router } from "express";
import { vehicleRoutes } from "../module/vichel/vichel.route";
import { riderRoute } from "../module/rider/ride.route";
import { rideRequestRoute } from "../module/ride_request/rider.route";
import { driverRoute } from "../module/driver/driver.route";

export const router = Router()

router.use('/vehicles', vehicleRoutes)
router.use('/rider', riderRoute)
router.use('/ride-request', rideRequestRoute)
router.use('/driver', driverRoute)





router.get('/', (req, res) => {
    res.json({ title: 'this is server entry point' })
})



