import { Schema, model, Document } from 'mongoose';
import {
    TPackageStatus,
    TPackageImage,
    TItinerary,
    TPackageCapacity,
    TFlightSupplier,
    THotelSupplier,
    TPackageSuppliers,
    TPackageCosting,
    TTourPackage,
} from './tour.interface';  

export interface TTourPackageDocument extends TTourPackage, Document { }

 

const ItinerarySchema = new Schema<TItinerary>(
    {
        day: { type: Number, required: true },
        title: { type: String, required: true, trim: true },
        activities: { type: [String], default: [] },
    },
    { _id: false }
);

const PackageCapacitySchema = new Schema<TPackageCapacity>(
    {
        minimum: { type: Number, required: true, min: 1 },
        maximum: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const FlightSupplierSchema = new Schema<TFlightSupplier>(
    {
        provider: { type: String, required: true },
        offerId: { type: String, required: true },
    },
    { _id: false }
);

const HotelSupplierSchema = new Schema<THotelSupplier>(
    {
        provider: { type: String, required: true },
        accommodationId: { type: String, required: true },
        roomId: { type: String },
    },
    { _id: false }
);

const PackageSuppliersSchema = new Schema<TPackageSuppliers>(
    {
        flight: { type: FlightSupplierSchema },
        hotel: { type: HotelSupplierSchema },
    },
    { _id: false }
);

const PackageCostingSchema = new Schema<TPackageCosting>(
    {
        flightCost: { type: Number, required: true, default: 0 },
        hotelCost: { type: Number, required: true, default: 0 },
        transportCost: { type: Number, required: true, default: 0 },
        activityCost: { type: Number, required: true, default: 0 },
        fixedCost: { type: Number, required: true, default: 0 },
    },
    { _id: false }
);
const category = ['arctic','beach','adventure','heritage','honeymoon','wildlife','city','hill_trek','luxury','family',]
const TourPackageSchema = new Schema<TTourPackageDocument>(
    {
        title: { type: String, required: true, trim: true },
        destination: { type: String, required: true, trim: true, index: true },
        description: { type: String, required: true },
        images: { type: [String], default: [] },
        duration: {
            days: { type: Number, required: true, min: 1 },
            nights: { type: Number, required: true, min: 0 },
        },
        categories: {type: [String], enum: category, default: [], index: true},
        departureDate: { type: Date, required: true, index: true },
        returnDate: { type: Date, required: true },
        itinerary: { type: [ItinerarySchema], default: [] },
        inclusions: { type: [String], default: [] },
        exclusions: { type: [String], default: [] },
        price: { type: Number, required: true, min: 0, index: true },
        capacity: { type: PackageCapacitySchema, required: true },
        status: {
            type: String,
            enum: [
                'draft',
                'open',
                'minimum_reached',
                'confirmed',
                'full',
                'cancelled',
                'completed',
            ] as TPackageStatus[],
            default: 'draft',
            index: true,
        },
        suppliers: { type: PackageSuppliersSchema, default: {} },
        costing: { type: PackageCostingSchema, required: true },
    },
    {
        timestamps: true,  
    }
);

 
TourPackageSchema.pre('validate', function (next) {
    if (this.returnDate && this.departureDate && this.returnDate <= this.departureDate) {
        return next(new Error('returnDate must be after departureDate'));
    }
    next();
});

// ── capacity.maximum >= capacity.minimum ──
TourPackageSchema.pre('validate', function (next) {
    if (this.capacity && this.capacity.maximum < this.capacity.minimum) {
        return next(new Error('capacity.maximum must be greater than or equal to capacity.minimum'));
    }
    next();
});

export const TourPackage = model<TTourPackageDocument>('tours', TourPackageSchema);