import mongoose from "mongoose"
import envData from "../config"
import status from "http-status"

type TerrrorSource = { path: string | number, message: string }[]



export const globalErrorHandler = (err: any, req: any, res: any, next: any) => {

    let statusCode = err?.status || status.BAD_REQUEST
    let message = err?.message || 'something went wrong'
    let errorSource: TerrrorSource = [{
        path: '',
        message: ''
    }]


    if (err?.name === 'ValidationError') {
        const placeErrorSource = Object.values(err?.errors).map((value: any) => {
            return {
                path: value?.path,
                message: value?.message
            }
        })

        statusCode = status.BAD_REQUEST
        errorSource = placeErrorSource
        message = 'validation error'
    }

    // Handle Mongoose Duplicate Key Error
    if (err.name === "MongoServerError" && err.code === 11000) {
        statusCode = status.BAD_REQUEST;
        message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    }

    if (err.name === 'CastError' || err instanceof mongoose.Error.CastError) {

        errorSource = [
            {
                path: err.path,
                message: `Invalid ID format: ${err.value}`
            }
        ]
        statusCode = status.BAD_REQUEST;
        message = 'Invalid ID format';

    }


    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        errorSource: errorSource,
        stack: envData.mode === "development" ? err.stack : undefined,
    });

}