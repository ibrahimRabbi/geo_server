import { RequestHandler } from "express";
import { uploadImage } from "../../helper/imageUploader";
import { catchAsync } from "../../helper/catchAsync";
import status from "http-status";
import { drivermodel, tempDrivermodel } from "./driver.model";
import envData from "../../config";
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';

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
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const payload = { ...req.body }
        delete payload.tempUserId

        const createDriver = await drivermodel.create([payload], { session });

        if (!createDriver || !createDriver[0]) {
            throw new Error('faild to create driver account');
        }

        const driver = createDriver[0];

        const deletingTempDriver = await tempDrivermodel.findByIdAndDelete(
            req.body?.tempUserId,
            { session }
        );

        const credentials = {
            fullName: driver?.fullName,
            identifier: driver.email ? driver.email : driver.phoneNumber,
            role: driver.role,
            userId: driver._id,
        };

        const accessToken = jwt.sign(credentials, envData.secretKey as string, { expiresIn: '12d' });

        await session.commitTransaction();
        session.endSession();

        res.status(status.OK).json({
            success: true,
            status: status.OK,
            message: 'driver account created successfully',
            token: accessToken
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});


export const driverSignInController: RequestHandler = catchAsync(async (req, res) => {
    const { identifier } = req.body;

    const signIn = await drivermodel.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }]
    });

    if (!signIn) {
        throw new Error('this user is not exist. please input a valid credential or register new one')
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


export const updateDriverLocationController: RequestHandler = catchAsync(async (req, res) => {

    const updating = await drivermodel.findByIdAndUpdate(
        req.user?._id,
        { 'currentLocation.coordinates': req.body.coordinates, 'currentLocation.type': 'Point' },
        { new: true, runValidators: true, context: 'query' }
    );

    if (!updating) {
        throw new Error('faild to update location')
    }

    return res.status(status.OK).json({
        success: true,
        status: status.OK,
        message: 'location updated successfully',
        data: updating
    });
});