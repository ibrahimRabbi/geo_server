import { Schema, model, Types } from 'mongoose';
import { TgeoLocation, TrideRequest } from './ride.interface';

 

const geoLocationSchema = new Schema<TgeoLocation>(
    {
        address: {
            type: String,
            required: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        langitude: {
            type: Number,
            required: true,
        },
          
    },
    { _id: false }
);

const rideRequestSchema = new Schema<TrideRequest>(
    {
        userId: {type: Schema.Types.ObjectId,ref: 'riders',required: true,},
        pickup: {type: geoLocationSchema,required: true,},
        dropOff: {type: geoLocationSchema,required: true,},
        totalDistanceKm: {type: Number,default : 0,},
        vehicel: {type: Schema.Types.ObjectId,ref: 'vehicles',default: null,},
        paymentType: {
            type: String,
            enum: {
                values: ['credit', 'COD'],
                message : '{VALUE} is invalid payment type'
            },
            default : null,
        },
        paymentStatus: {
            type: String,
            enum: {
                values: ['paid', 'unpaid'],
                message: '{VALUE} is invalid payment status'
            },
            default : 'unpaid'
        },
        fare: {type: Number,default : 0,},
        note: {type: String,default: '',},
    },
    { timestamps: true, strict:'throw' }
);

export const RideRequestModel = model<TrideRequest>('rideRequests', rideRequestSchema);