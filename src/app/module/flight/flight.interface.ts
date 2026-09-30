export type TcreateCheckoutSession = {
    amount: number;
    currency?: string;
    productName: string;
    bookingId: string;
}