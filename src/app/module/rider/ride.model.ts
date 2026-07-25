import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import { Trider } from './rider.interface';




const riderSchema = new Schema<Trider>({
    name: {
        type: String,
        default: '',
        trim: true,
        minlength: 3,
        maxlength: 100,
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

    profileImage: {
        type: String,
        default: 'https://res.cloudinary.com/dymnrefpr/image/upload/v1757822614/qzvkz2mczodyvwasqtlk.jpg',
    },
    role : {
        type: String,
        enum: ['rider', 'admin'],
        default: 'rider',
    },
    creditBlance : {type:Number, default:0},

    isEmailVerified: {
        type: Boolean,
        default: false,
    },

    isPhoneVerified: {
        type: Boolean,
        default: false,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

},
    {
        timestamps: true,
        strict: 'throw',
    });





riderSchema.pre('validate', function (next) {
    if (!this.email && !this.phoneNumber) {
        next(new Error('Either email or phone number is required'));
    } else {
        next();
    }
});




const riderModel = mongoose.model<Trider>('riders', riderSchema);
export default riderModel;