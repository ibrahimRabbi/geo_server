import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });
 
const envData = {
    port: process.env.PORT || 5000,
    databaseUrl: process.env.DATABASE_URL || '',
    mode: process.env.MODE || 'development',
    secretKey: process.env.SECRET_KEY || '',
    googleMapApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    duffle_accessToken: process.env.DUFFEL_ACCESS_TOKEN || '',
    stripe_publish_key: process.env.STRIPE_PUBLISH_KEY,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY
}

export default envData;
 

  