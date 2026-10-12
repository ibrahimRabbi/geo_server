import { Schema, model } from "mongoose";
import { TbookingTour } from "./bookingTour.interface";
 

const bookingSchema = new Schema<TbookingTour>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "riders",
            required: [true, "User ID is required"],
        },

        packageId: {
            type: Schema.Types.ObjectId,
            ref: "tours",
            required: [true, "Package ID is required"],
        },

        paymentIntentId: {
            type: String,
            required: [true, "Payment intent ID is required"],
            trim: true,
        },

        stripeSessionId: {
            type: String,
            required: [true, "Stripe session ID is required"],
            trim: true,
        },

        isPaid: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const bookingToureModel = model<TbookingTour>("tourBooking", bookingSchema);