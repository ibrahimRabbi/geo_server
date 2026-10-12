import { Schema, model } from 'mongoose';

const PassengerSchema = new Schema(
    {
        duffelPassengerId: { type: String, required: true },
        title: { type: String, required: true },
        givenName: { type: String, required: true },
        familyName: { type: String, required: true },
        gender: { type: String, required: true },
        bornOn: { type: String, required: true },
    },
    { _id: false }
);

const FlightSummarySchema = new Schema(
    {
        airline: { type: String },
        originCity: { type: String },
        destinationCity: { type: String },
        departureDate: { type: String },
        returnDate: { type: String },
    },
    { _id: false }
);

const FlightBookingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref:'riders', required: true },
    stripeSessionId: { type: String, required: true, unique: true, index: true },
    paymentIntentId: { type: String },
    offerId: { type: String, required: true },
    duffelOrderId: { type: String },
    bookingReference: { type: String },
    amountPaid: { type: Number, required: true },
    currency: { type: String, required: true },
    passengers: { type: [PassengerSchema], default: [] },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    flightSummary: { type: FlightSummarySchema },
    status: {
        type: String,
        enum: ['confirmed', 'payment_succeeded_booking_failed', 'cancelled'],
        required: true,
    },
    errorMessage: { type: String },
    duffelOrderRaw: { type: Schema.Types.Mixed },
},
    { timestamps: true }
);

export const flightBookingModel = model('flightBookings', FlightBookingSchema);