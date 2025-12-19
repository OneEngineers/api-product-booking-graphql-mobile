import Redis from 'ioredis';
import { ENV } from '../constants';

const REDIS_URI = `redis://${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`;
const redis = new Redis(REDIS_URI);

export { redis };
