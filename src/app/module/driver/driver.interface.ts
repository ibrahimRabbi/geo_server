 

export type VehicleType = 'Car' | 'Bike' | "Haice" | 'Auto/CNG';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

 

export interface TVehicleInfo {
    vehicleType: VehicleType;
    model: string;
    numberPlate: string;
    manufacturingYear: string;
}

export interface TDriverDocuments {
    licenseFrontUrl: string;
    licenseBackUrl: string;
    nidUrl: string;
    regPaperUrl: string;
    vehiclePhotoUrl: string;
    selfieUrl: string;
}

export type TcurrentLocation = {
    type: 'Point',
    coordinates : number[]
}

export interface TDriverOnboarding {
    fullName: string;
    nidNumber: string;
    dateOfBirth: string;
    address: string;
    email: string;
    phoneNumber: string;
    role: 'driver';
    currentLocation : TcurrentLocation
    vehicleInfo: TVehicleInfo;
    documents: TDriverDocuments;
    status: VerificationStatus;
    rejectionReason?: string;
    isDeleted: boolean;
}

 