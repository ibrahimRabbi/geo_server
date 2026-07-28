import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import  envData  from "../config";
import riderModel from "../module/rider/ride.model";
import { drivermodel } from "../module/driver/driver.model";
 
 

 





export const authentication = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
             throw new Error("Unauthorized: No token provided");  
        }


        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new Error('unauthorized user');
        }

        //const decodeUser = jwt.verify(token as string, envData.secretKey as string)
        const decodeUser = jwt.verify(token, envData.secretKey as string) as JwtPayload;

        if (!decodeUser) {
            throw new Error('unauthorized user')
        }

        if (decodeUser?.role === 'rider') {
            const findUser = await riderModel.findOne({
                _id: (decodeUser as JwtPayload).userId,
                isDeleted: { $ne: true }
            });

            if (!findUser) {
                throw new Error('unauthorized user')
            }
            req.user = findUser
            next()
        }

        if (decodeUser?.role === 'driver') {
            const findUser = await drivermodel.findOne({
                _id: (decodeUser as JwtPayload).userId,
                isDeleted: { $ne: true }
            });

            if (!findUser) {
                throw new Error('unauthorized user')
            }
            req.user = findUser
            next()
        }

    } catch (err: any) {
        next(err);
    }
}