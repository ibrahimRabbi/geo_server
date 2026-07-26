 import axios from 'axios';
import envData from '../config';

export async function getRoadDistanceKm(
    pickup: { latitude: number; langitude: number },
    dropOff: { latitude: number; langitude: number }
): Promise<{ distanceKm: number; durationMin: number }> {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickup.latitude},${pickup.langitude}&destinations=${dropOff.latitude},${dropOff.langitude}&key=${envData.googleMapApiKey}`);

    const element = response.data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== 'OK') {
        throw new Error('Could not calculate road distance');
    }

    return {
        distanceKm: element.distance.value / 1000,  
        durationMin: Math.ceil(element.duration.value / 60),  
    };
}