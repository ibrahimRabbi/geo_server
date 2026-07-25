 export type VehicleTypeName = 'Bike Saver'| 'Apex Go'| 'Apex Premier'| 'Apex XL'| 'Auto / CNG' | 'Apex Intercity';


export type VehicleBadge = 'PROMO APPLIED'| 'GOOD DEAL'| 'ECO CHOICE'| 'POPULAR'| 'FASTEST'| 'EXTRA SEATS' | 'LONG DISTANCE';


export interface Tvehicles {
    vehicle_name: VehicleTypeName;
    capacity: number;
    description?: string;
    image?: string;
    baseFare: number;
    perKmRate: number;
    perMinRate?: number;
    isActive?: boolean;
    badge?: VehicleBadge;
}

 