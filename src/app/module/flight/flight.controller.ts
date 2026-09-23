 import { Duffel } from "@duffel/api";
import envData from "../../config";
import { catchAsync } from "../../helper/catchAsync";
import { RequestHandler } from "express";
import status from "http-status";

 

const duffel = new Duffel({ token: envData.duffle_accessToken });

 
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
    duration: (o) =>
        o.slices?.map((s: any) => s.duration) ?? [],
    stops: (o) =>
        o.slices?.map((s: any) => Math.max((s.segments?.length ?? 1) - 1, 0)) ?? [],
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
    baggage: (o) =>
        o.slices?.[0]?.segments?.[0]?.passengers?.[0]?.baggages ?? [],
    conditions: (o) => o.conditions,
};

const DEFAULT_FIELDS = ['id', 'price', 'airline', 'duration', 'stops', 'segments'];

const parseFieldsParam = (fieldsParam?: string): string[] => {
    if (!fieldsParam) return DEFAULT_FIELDS;

    const tokens = fieldsParam
        .split(/[\s,]+/)
        .filter(Boolean);

    const excluded = tokens.filter((t) => t.startsWith('-')).map((t) => t.slice(1));
    const included = tokens.filter((t) => !t.startsWith('-'));

    // যদি শুধু exclude ফিল্ড দেওয়া থাকে (যেমন "-conditions"), তাহলে default থেকে বাদ দিয়ে বাকিটা রাখি
    if (included.length === 0 && excluded.length > 0) {
        return DEFAULT_FIELDS.filter((f) => !excluded.includes(f));
    }

    // include দেওয়া থাকলে সেগুলোই ব্যবহার হবে, শুধু ভুল/অচেনা ফিল্ড নাম ফিল্টার আউট
    return included.filter((f) => FIELD_EXTRACTORS[f]);
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
    console.log('Request body:', req.body);
    const {
        origin,
        destination,
        departureDate,
        returnDate, // ← destructure করা হচ্ছে
        cabinClass,
        limit = 20,
        maxConnections = 2,
        passengers = [{ type: 'adult' }],
        sort = 'total_amount',
        fields } = req.body;

    // ── outbound slice সবসময় থাকবে ──
    const slices: any[] = [
        {
            origin,
            destination,
            departure_date: departureDate,
            arrival_time: null,
            departure_time: null,
        },
    ];

    // ── returnDate থাকলে দ্বিতীয় (return) slice যোগ হবে, origin/destination উল্টে ──
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
        slices, // ← এখন dynamic, ১টা বা ২টা slice
        passengers: passengers.map((p: any) => ({ type: p.type })),
        cabin_class: cabinClass,
        max_connections: maxConnections,  
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
        fields: selectedFields,
        isRoundTrip: Boolean(returnDate), // ← ডিবাগ/ফ্রন্টএন্ডের সুবিধার জন্য যোগ করলাম
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
 
 

 
 