import { Duffel } from "@duffel/api";
import envData from "../../config";
import { catchAsync } from "../../helper/catchAsync";
import { RequestHandler } from "express";
import status from "http-status";
 
import Stripe from "stripe";
import { flightBookingModel } from "../bookingFlight/booking.model";
import { createCheckoutSessionService } from "../payment/payment.services";
 



const duffel = new Duffel({ token: envData.duffle_accessToken });
const stripe = new Stripe(envData.stripe_secret_key as string);

const DEFAULT_FIELDS = ['id', 'price', 'airline', 'duration', 'stops', 'segments', 'passengers'];



const FIELD_EXTRACTORS: Record<string, (offer: any) => any> = {
    id: (o) => o.id,
    price: (o) => ({ amount: o.total_amount, currency: o.total_currency }),
    total_amount: (o) => o.total_amount,
    total_currency: (o) => o.total_currency,
    expires_at: (o) => o.expires_at,
    airline: (o) => ({
        name: o.owner?.name,
        iata_code: o.owner?.iata_code,
        logo: o.owner?.logo_symbol_url,
    }),
    duration: (o) => o.slices?.map((s: any) => s.duration) ?? [],
    stops: (o) => o.slices?.map((s: any) => Math.max((s.segments?.length ?? 1) - 1, 0)) ?? [],
    segments: (o) =>
        o.slices?.map((s: any) =>
            s.segments?.map((seg: any) => ({
                origin: seg.origin?.iata_code,
                destination: seg.destination?.iata_code,
                departing_at: seg.departing_at,
                arriving_at: seg.arriving_at,
                flight_number: seg.flight_number,
                carrier: seg.marketing_carrier?.iata_code,
                aircraft: seg.aircraft?.name,
            }))
        ) ?? [],
    cabin_class: (o) => o.cabin_class ?? o.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class,
    baggage: (o) => o.slices?.[0]?.segments?.[0]?.passengers?.[0]?.baggages ?? [],
    conditions: (o) => o.conditions,

     
    passengers: (o) =>
        o.passengers?.map((p: any) => ({
            id: p.id,
            type: p.type, // "adult" | "child" | "infant_without_seat"
            age: p.age,
        })) ?? [],
};

const parseFieldsParam = (fieldsParam?: string[]): string[] => {
    if (!fieldsParam || fieldsParam.length === 0) return DEFAULT_FIELDS;
    return fieldsParam.filter((f) => FIELD_EXTRACTORS[f]);
};

const selectOfferFields = (offer: any, fields: string[]) => {
    const result: Record<string, any> = {};
    for (const field of fields) {
        const extractor = FIELD_EXTRACTORS[field];
        if (extractor) result[field] = extractor(offer);
    }
    return result;
};

export const searchFlightsController: RequestHandler = catchAsync(async (req, res) => {
    const {
        origin,
        destination,
        departureDate,
        returnDate,
        cabinClass,
        limit = 20,
        passengers = [{ type: 'adult' }],
        sort = 'total_amount',
    } = req.body;

   
    const fields = DEFAULT_FIELDS;

    const slices: any[] = [
        {
            origin,
            destination,
            departure_date: departureDate,
            arrival_time: null,
            departure_time: null,
        },
    ];

    if (returnDate) {
        slices.push({
            origin: destination,
            destination: origin,
            departure_date: returnDate,
            arrival_time: null,
            departure_time: null,
        });
    }

    const response = await duffel.offerRequests.create({
        slices,
        passengers: passengers.map((p: any) => ({ type: p.type })),
        cabin_class: cabinClass,
        max_connections: 2,
    });

    let offers = response.data.offers ?? [];

    if (sort) {
        const desc = sort.startsWith('-');
        const key = desc ? sort.slice(1) : sort;
        offers = [...offers].sort((a: any, b: any) => {
            const valA = key === 'total_amount' ? Number(a.total_amount) : a.total_duration;
            const valB = key === 'total_amount' ? Number(b.total_amount) : b.total_duration;
            return desc ? valB - valA : valA - valB;
        });
    }

    offers = offers.slice(0, Number(limit));

    const selectedFields = parseFieldsParam(fields);
    const slimOffers = offers.map((offer: any) => selectOfferFields(offer, selectedFields));

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'Flight search results retrieved successfully',
        count: slimOffers.length,
        isRoundTrip: Boolean(returnDate),
        data: {
            offer_request_id: response.data.id,
            offers: slimOffers,
        },
    });
});


export const searchPlacesController: RequestHandler = catchAsync(async (req, res) => {
    const { query } = req.query;

    if (!query || String(query).trim().length < 2) {
        return res.status(status.OK).json({
            status: status.OK,
            success: true,
            message: 'Query too short',
            data: [],
        });
    }


    const response = await duffel.suggestions.list({ query: String(query) });

    const places = response.data.map((place: any) => ({
        id: place.id,
        type: place.type,
        name: place.name,
        iata_code: place.iata_code,
        city_name: place.city_name ?? place.city?.name,
        country_name: place.country_name,
        airports: place.airports?.map((a: any) => ({
            name: a.name,
            iata_code: a.iata_code,
        })),
    }));

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'Places retrieved successfully',
        data: places,
    });
});


 


export const verifyPaymentAndBookFlight: RequestHandler = catchAsync(async (req, res, next) => {
    const { sessionId, offerId, passengers, contactEmail, contactPhone, flightSummary } = req.body;

    if (!sessionId || !offerId) {
        throw new Error('sessionId and offerId are required.');
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
        return res.status(status.BAD_REQUEST).json({
            status: status.BAD_REQUEST,
            success: false,
            message: 'passengers array is required and cannot be empty.',
        });
    }

    const missingIdIndex = passengers.findIndex((p: any) => !p.duffelPassengerId);
    if (missingIdIndex !== -1) {
        return res.status(status.BAD_REQUEST).json({
            status: status.BAD_REQUEST,
            success: false,
            message: `Passenger at index ${missingIdIndex} is missing duffelPassengerId.`,
        });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    //checking payment status
    if (session.payment_status !== 'paid') {
        return res.status(status.PAYMENT_REQUIRED).json({
            status: status.PAYMENT_REQUIRED,
            success: false,
            message: 'Payment not completed for this session.',
            paymentStatus: session.payment_status,
        });
    }

    //creating a flight booking
    let duffelOrder;
    try {
        duffelOrder = await duffel.orders.create({
            type: 'instant',
            selected_offers: [offerId],
            passengers: passengers.map((p: any) => ({
                id: p.duffelPassengerId,
                title: p.title,
                given_name: p.givenName,
                family_name: p.familyName,
                gender: p.gender,
                born_on: p.bornOn,
                email: contactEmail,
                phone_number: contactPhone,
            })),
            payments: [
                {
                    type: 'balance',
                    currency: session.currency?.toUpperCase() ?? 'USD',
                    amount: String((session.amount_total ?? 0) / 100),
                },
            ],
        });
    } catch (err: any) {
        console.error('Message:', err?.message);
        let refundSucceeded = false;
        try {
            if (session.payment_intent) {
                await stripe.refunds.create({ payment_intent: session.payment_intent as string });
                refundSucceeded = true;
            }
        } catch (refundErr: any) {
            console.error('CRITICAL: refund also failed:', refundErr.message);
        }

        
        await flightBookingModel.create({
            userId:req?.user?._id,
            stripeSessionId: sessionId,
            paymentIntentId: session.payment_intent as string,
            offerId,
            amountPaid: (session.amount_total ?? 0) / 100,
            currency: session.currency,
            passengers,
            contactEmail,
            contactPhone,
            flightSummary,
            status: 'payment_succeeded_booking_failed',
            errorMessage: `${err?.message ?? 'Unknown Duffel error'}${refundSucceeded ? ' (refunded)' : ' (REFUND FAILED - manual action needed)'}`,
        });

        return res.status(status.INTERNAL_SERVER_ERROR).json({
            status: status.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to confirm your flight booking. Your payment has been refunded.',
            ...(envData.mode !== 'production' && {
                debug: err?.response?.data ?? err?.errors ?? err?.message,
            }),
        });
    }

    await stripe.checkout.sessions.update(sessionId, {
        metadata: {
            ...session.metadata,
            duffelOrderId: duffelOrder.data.id,
            bookingReference: duffelOrder.data.booking_reference ?? '',
        },
    });

     
    await flightBookingModel.create({
        userId: req?.user?._id,
        stripeSessionId: sessionId,
        paymentIntentId: session.payment_intent as string,
        offerId,
        duffelOrderId: duffelOrder.data.id,
        bookingReference: duffelOrder.data.booking_reference ?? '',
        amountPaid: (session.amount_total ?? 0) / 100,
        currency: session.currency,
        passengers,
        contactEmail,
        contactPhone,
        flightSummary,
        status: 'confirmed',
        duffelOrderRaw: duffelOrder.data,
    });

    res.status(status.OK).json({
        status: status.OK,
        success: true,
        message: 'Booking confirmed',
        data: {
            duffelOrder: duffelOrder.data,
            duffelOrderId: duffelOrder.data.id,
            bookingReference: duffelOrder.data.booking_reference,
            amountPaid: (session.amount_total ?? 0) / 100,
            currency: session.currency,
            flightSummary,
            passengers,
            contactEmail,
        },
    });
});














