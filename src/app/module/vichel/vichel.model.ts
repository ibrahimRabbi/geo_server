import { model, Schema } from "mongoose";
import { Tvehicles } from "./vichel.interface";

const vehicleSchema = new Schema<Tvehicles>({
    vehicle_name: {
        type: String,
        enum: {
            values: ['Geo Go', 'Geo Premier', 'Geo XL', 'Geo Intercity', 'Bike Saver', 'Auto / CNG'],
            message: '{VALUE} is not a valid vehicle name'
        },
        required: true
    },
    capacity: { type: Number, required: true },
    description: { type: String, required: false },
    image: { type: String, required: true },
    baseFare: { type: Number, required: true },
    perKmRate: { type: Number, required: true },
    perMinRate: { type: Number, required: false },
    badge: {
        type: String, enum: {
        values: ['PROMO APPLIED', 'GOOD DEAL', 'ECO CHOICE', 'POPULAR', 'FASTEST', 'EXTRA SEATS', 'LONG DISTANCE'],
        message: '{VALUE} is not a valid badge'
        },
        required: false
    },
    isActive: { type: Boolean, required: false, default: true }
},{timestamps: true});

export const vehicleModel = model<Tvehicles>('vehicles', vehicleSchema);
