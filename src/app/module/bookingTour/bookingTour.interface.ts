import { Types } from "mongoose"

export type TbookingTour = {
    userId: Types.ObjectId,
    packageId: Types.ObjectId,
    paymentIntentId: string,
    stripeSessionId: string,
    isPaid: boolean,
    isDeleted : boolean
}