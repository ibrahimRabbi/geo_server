import { Types } from "mongoose";

 

 


export type Trider = {
    name: string;
    email?: string;
    phoneNumber?: string;
    profileImage: string;
    role: 'rider' | 'admin';
    creditBlance: number;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isDeleted: boolean;
    isActive: boolean; 
};