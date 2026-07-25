import { RequestHandler } from "express"
import status from "http-status"
import { catchAsync } from "../../helper/catchAsync"
import riderModel from "./ride.model"
import { Trider } from "./rider.interface"
import jwt from "jsonwebtoken"
import envData from "../../config"
 

export const signInController: RequestHandler = catchAsync(async (req, res) => {
    const { identifier } = req.body;
    const isEmail = identifier.includes('@') && identifier.includes('.');

    const existingUser = await riderModel.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }]
    });

    if (existingUser) {
        const credentials = {
            name: existingUser.name,
            identifier: identifier,
            userId: existingUser._id,
            role: existingUser.role,
        };

        const accessToken = jwt.sign(credentials, envData.secretKey as string, {expiresIn: '12d'});

        return res.status(status.OK).json({
            success: true,
            status: status.OK,
            message: 'Sign in successfully',
            isExist: true,
            token: accessToken,
        });
    }

   
    const newUserData: Partial<Trider> = {
        name: `User_${Math.floor(Math.random() * 10000)}`,
        email: isEmail ? identifier : null,
        phoneNumber: !isEmail ? identifier : null,
    };

    
    delete (newUserData as any).identifier;

    const newUser = await riderModel.create(newUserData);

    
    const credentials = {
        name: newUser.name,
        identifier: newUser.email ? newUser.email : newUser.phoneNumber,
        role: newUser.role,
        userId: newUser._id, 
    };

    const accessToken = jwt.sign(credentials, envData.secretKey as string, {expiresIn: '12d'});

    return res.status(status.OK).json({
        success: true,
        status: status.OK,
        message: 'Account created successfully',
        isExist: false,
        token: accessToken,
    });
});


export const getRiderProfileController: RequestHandler = catchAsync(async (req, res) => {
    
    return res.status(status.OK).json({
        success: true,
        status: status.OK,
        message: 'profile data retrived successfully',
       data :  req.user
    });
});

 
