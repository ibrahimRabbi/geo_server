import { Schema, model, Document } from 'mongoose';
import { TDriverOnboarding, TVehicleInfo, TDriverDocuments, VehicleType, VerificationStatus, TcurrentLocation } from './driver.interface';
import validator from 'validator'


export interface IDriverOnboardingDocument extends TDriverOnboarding, Document { }



const VehicleInfoSchema = new Schema<TVehicleInfo>({
    vehicleType: {
        type: String,
        enum: {
            values: ['Car', 'Bike', "Haice", 'Auto/CNG'] as VehicleType[],
            message: '{VALUE} is not a valid vehicle type',
        },
        required: [true, 'Vehicle type is required'],
    },
    model: {
        type: String,
        required: [true, 'Vehicle model is required'],
        trim: true,
    },
    numberPlate: {
        type: String,
        required: [true, 'Number plate is required'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    manufacturingYear: {
        type: String,
        required: [true, 'Manufacturing year is required'],
        trim: true,
    },
}, { _id: false });

const DriverDocumentsSchema = new Schema<TDriverDocuments>({
    licenseFrontUrl: {
        type: String,
        required: [true, 'Driving license (front) is required'],
    },
    licenseBackUrl: {
        type: String,
        required: [true, 'Driving license (back) is required'],
    },
    nidUrl: {
        type: String,
        required: [true, 'NID image is required'],
    },
    regPaperUrl: {
        type: String,
        required: [true, 'Vehicle registration paper is required'],
    },
    vehiclePhotoUrl: {
        type: String,
        required: [true, 'Vehicle photo is required'],
    },
    selfieUrl: {
        type: String,
        required: [true, 'Selfie is required'],
    },
}, { _id: false });

const currentLocationSchema = new Schema<TcurrentLocation>({
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number],required: true, default: [0, 0]},
}, { _id: false })

const DriverSchema = new Schema<IDriverOnboardingDocument>({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    nidNumber: {
        type: String,
        required: [true, 'NID number is required'],
        index: true,
        unique: true,
        trim: true,
    },
    dateOfBirth: {
        type: String,
        required: [true, 'Date of birth is required'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    email: {
        type: String,
        unique: [true, 'this user already exists'],
        sparse: true,
        lowercase: true,
        trim: true,
        validate: [
            {
                validator: function (v: string) {
                    return !v || validator.isEmail(v);
                },
                message: 'Invalid email format',
            }
        ]
    },

    phoneNumber: {
        type: String,
        unique: [true, 'this user already exists'],
        sparse: true,
        validate: [
            {
                validator: function (v: string) {
                    return !v || /^\+?\d{11,14}$/.test(v);
                },
                message: 'Phone number must be 11-14 digits and can start with +',
            }
        ]
    },
    role: { type: String, default: 'driver' },
    currentLocation: { type: currentLocationSchema, default: () => ({}), },
    vehicleInfo: {
        type: VehicleInfoSchema,
        required: [true, 'Vehicle info is required'],
    },
    documents: { type: DriverDocumentsSchema, required: [true, 'Driver documents are required'], },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'] as VerificationStatus[],
        default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    isDeleted: { type: Boolean, index: true, default: false, },
},
    {
        timestamps: true,
        strict: 'throw'
    }
);

const tempDriverSchema = new Schema<IDriverOnboardingDocument>({
    email: {
        type: String,
        trim: true,
        validate: [
            {
                validator: function (v: string) {
                    return !v || validator.isEmail(v);
                },
                message: 'Invalid email format',
            }
        ]
    },

    phoneNumber: {
        type: String,
        validate: [
            {
                validator: function (v: string) {
                    return !v || /^\+?\d{11,14}$/.test(v);
                },
                message: 'Phone number must be 11-14 digits and can start with +',
            }
        ]
    },
})



export const tempDrivermodel = model<IDriverOnboardingDocument>('tempDrivers', tempDriverSchema);
export const drivermodel = model<IDriverOnboardingDocument>('drivers', DriverSchema);