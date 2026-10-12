import { Router } from "express"
import { authentication } from "../../middleware/authentication"
import { paymentCheckOutSessionController } from "./payment.controller"

export const paymentRoute = Router()

paymentRoute.post("/create-checkout-session", authentication, paymentCheckOutSessionController)