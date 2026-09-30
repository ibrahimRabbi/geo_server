export type TPackageStatus =
    | "draft"
    | "open"
    | "minimum_reached"
    | "confirmed"
    | "full"
    | "cancelled"
    | "completed";

export interface TPackageImage {
    url: string;
    public_id: string;
}

export interface TItinerary {
    day: number;
    title: string;
    activities: string[];
}

export interface TPackageCapacity {
    minimum: number;
    maximum: number;
}

export interface TFlightSupplier {
    provider: string;
    offerId: string;
}

export interface THotelSupplier {
    provider: string;
    accommodationId: string;
    roomId?: string;
}

export interface TPackageSuppliers {
    flight?: TFlightSupplier;
    hotel?: THotelSupplier;
}

export interface TPackageCosting {
    flightCost: number;
    hotelCost: number;
    transportCost: number;
    activityCost: number;
    fixedCost: number;
}

export interface TTourPackage {
    title: string;
    destination: string;
    description: string;
    images: string[];
    duration: {
        days: number;
        nights: number;
    };
    departureDate: Date;
    returnDate: Date;
    itinerary: TItinerary[];
    inclusions: string[];
    exclusions: string[];
    price: number;
    capacity: TPackageCapacity;
    status: TPackageStatus;
    suppliers: TPackageSuppliers;
    costing: TPackageCosting;
}