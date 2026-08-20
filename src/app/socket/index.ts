// socket/index.ts
import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

type PendingOffer = {
    resolve: (accepted: boolean) => void;
};

const pendingOffers = new Map<string, PendingOffer>(); // key: `${rideRequestId}:${driverId}`

export const registerPendingOffer = (
    rideRequestId: string,
    driverId: string,
    resolve: (accepted: boolean) => void
) => {
    pendingOffers.set(`${rideRequestId}:${driverId}`, { resolve });
};

export const resolvePendingOffer = (rideRequestId: string, driverId: string, accepted: boolean) => {
    const key = `${rideRequestId}:${driverId}`;
    const offer = pendingOffers.get(key);

    if (offer) {
        offer.resolve(accepted);
        pendingOffers.delete(key);
    }
};


export const initializeSocket = (server: HTTPServer): Server => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.handshake.auth?.driverId || socket.handshake.auth?.riderId;
        if (!userId) {
            console.warn('Connection rejected: no driverId/riderId provided');
            socket.disconnect();
            return;
        }

        socket.join(userId);
        console.log('A user connected:', socket.id, 'User ID:', userId);

        socket.on('ride:accept', (data: { rideRequestId: string; driverId: string }) => {
            resolvePendingOffer(data.rideRequestId, data.driverId, true);
        });

        socket.on('ride:decline', (data: { rideRequestId: string; driverId: string }) => {
            resolvePendingOffer(data.rideRequestId, data.driverId, false);
        });

        //rider picked up
        socket.on('ridePickedUp', (data: { driverId: string,status:string }) => {
             io.to(data.driverId).emit('acceptPickedUpStatus', { status:data.status });
        });

        socket.on('rideComplete', (data: { driverId: string, status: string }) => {
            io.to(data.driverId).emit('completeStatus', { status: data.status });
        });

        socket.on('payment', (data: { driverId: string, paymentStatus: string }) => {
            io.to(data.driverId).emit('paymentPaid', { paymentStatus: data.paymentStatus });
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id, 'User ID:', userId);
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket first.');
    }
    return io;
};