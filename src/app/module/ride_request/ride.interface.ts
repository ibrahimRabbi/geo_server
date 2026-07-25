import { Types } from "mongoose"


export type TgeoLocation = {
    address: String;
    latitude: Number;
    langitude: Number;
}
export type TrideRequest = {
    userId: Types.ObjectId;
    pickup: TgeoLocation;
    dropOff: TgeoLocation;
    totalDistance: number,
    duration: {};
    vehicel: Types.ObjectId | null,
    fare: number,
    paymentType: 'credit' | 'COD'
    paymentStatus : 'paid' | 'unpaid'
    note: string,
    
}