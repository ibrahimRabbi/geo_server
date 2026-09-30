import { RequestHandler } from 'express';
import status from 'http-status';
import { catchAsync } from '../../helper/catchAsync';
import { TourPackage } from './tour.model';

  

export const getAllTourPackages: RequestHandler = catchAsync(async (req, res) => {
       
    const packages = await TourPackage.find().select('-itinerary -inclusions -exclusions -suppliers -description -departureDate -returnDate -costing').limit(10)

        res.status(status.OK).json({
            status: status.OK,
            success: true,
            message: 'Tour packages retrieved successfully',
            data: packages,
        });
    }
);


export const getSingleTourPackages: RequestHandler = catchAsync(async (req, res) => {


    const packages = await TourPackage.findById(req.params?.id)

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'Tour packages retrieved successfully',
        data: packages,
    });
}
);