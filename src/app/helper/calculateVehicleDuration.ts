const vehicleAvSpeedkmPh = {
    bike_saver: 30,
    auto_cng: 18,
    geo_go: 20,
    geo_premier: 20,
    geo_xl: 20,
    geo_intercity: 55,
} as const;
type TVehicleKey = keyof typeof vehicleAvSpeedkmPh;


export const calculateAllVehicleDurations = (distanceInKm: number) => {
    const INITIAL_BUFFER_MINUTES = 2;
    const durations: Record<TVehicleKey, number> = {} as Record<TVehicleKey, number>;

     
    (Object.keys(vehicleAvSpeedkmPh) as TVehicleKey[]).forEach((vehicle) => {
        const speed = vehicleAvSpeedkmPh[vehicle];
        const travelTime = (distanceInKm / speed) * 60;
        durations[vehicle] = Math.ceil(travelTime) + INITIAL_BUFFER_MINUTES;
    });

    return durations;
};