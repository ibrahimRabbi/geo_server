import { Types } from "mongoose"


export type TgeoLocation = {
    address: String;
    latitude: Number;
    langitude: Number;
}
export type TrideRequest = {
    userId: Types.ObjectId;
    driverId?: Types.ObjectId;
    pickup: TgeoLocation;
    dropOff: TgeoLocation;
    totalDistanceKm: number,
    vehicle: Types.ObjectId | null,
    fare: number,
    paymentType: 'credit' | 'COD'
    paymentStatus: 'paid' | 'unpaid'
    status: 'pending' | 'accepted' | 'picked' | 'no_driver_found' | 'on-trip' | 'cancelled' | 'completed';
    note: string,
    
}