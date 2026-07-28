import { RequestHandler } from "express";
import { uploadImage } from "../../helper/imageUploader";
import { catchAsync } from "../../helper/catchAsync";
import status from "http-status";
import { drivermodel, tempDrivermodel } from "./driver.model";
import envData from "../../config";
import jwt from 'jsonwebtoken'

export const singleImageUploadController: RequestHandler = catchAsync(async (req, res, next) => {

    if (!req.file?.path) {
        throw new Error('please provide an image')
    }

    const imageNamePrefix = `geoMade_${Math.random().toString().split('.')[1]}`;
    const imagePath = req.file.path

    const result = await uploadImage(imagePath, `${imageNamePrefix}`);

    res.status(status.OK).json({
        success: true,
        status: status.OK,
        message: 'image uploaded successfully',
        url: result.secure_url
    })
});

export const tempDriverController: RequestHandler = catchAsync(async (req, res, next) => {
    const { identifier } = req.body;
    const isEmail = identifier.includes('@') && identifier.includes('.');
    const checkExistancy = await drivermodel.findOne({
        $or: [
            { phoneNumber: identifier },
            { email: identifier }
        ]
    })
    if (checkExistancy) {
        throw new Error('this user already exist please sign in or input unique email & phone number')
    }

    const createTempDriver = await tempDrivermodel.create({
        email: isEmail ? identifier : null,
        phoneNumber: !isEmail ? identifier : null,
    })

    if (!createTempDriver) {
        throw new Error('faild to create driver account')
    }

    res.status(status.OK).json({
        success: true,
        status: status.OK,
        message: 'driver initally created please give us your full details',
        data: createTempDriver
    })

})


export const createDriverController: RequestHandler = catchAsync(async (req, res, next) => {

    const createDriver = await drivermodel.create(req.body)
    if (!createDriver) {
        throw new Error('faild to create driver account')
    }

    const credentials = {
        fullName: createDriver?.fullName,
        identifier: createDriver.email ? createDriver.email : createDriver.phoneNumber,
        role: createDriver.role,
        userId: createDriver._id,
    };

    const accessToken = jwt.sign(credentials, envData.secretKey as string, { expiresIn: '12d' });

    res.status(status.OK).json({
        success: true,
        status: status.OK,
        message: 'driver account created successfully',
        token: accessToken
    })

})


export const driverSignInController: RequestHandler = catchAsync(async (req, res) => {
    const { identifier } = req.body;

    const signIn = await drivermodel.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }]
    });

    if (!signIn) {
        throw new Error('faild to sign in')
    }


    const credentials = {
        fullName: signIn.fullName,
        identifier: identifier,
        userId: signIn._id,
        role: signIn.role,
    };

    const accessToken = jwt.sign(credentials, envData.secretKey as string, { expiresIn: '12d' });

    return res.status(status.OK).json({
        success: true,
        status: status.OK,
        message: 'Sign in successfully',
        isExist: true,
        token: accessToken,
    });

});


export const getDriverProfileController: RequestHandler = catchAsync(async (req, res) => {

    return res.status(status.OK).json({
        success: true,
        status: status.OK,
        message: 'profile data retrived successfully',
        data: req.user
    });
});