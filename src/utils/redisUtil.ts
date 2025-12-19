/* eslint-disable consistent-return */
import { redis } from '../configs';

export const setRedisCache = async (key: string, value: any, time) => {
  try {
    const data = JSON.stringify(value);
    if (time) return await redis.set(key, data, 'EX', time);
    return await redis.set(key, data);
  } catch (error) {
    console.log('error set redis cache: ', error);
  }
};

export const getRedisCache = async (key: string) => {
  try {
    const result = await redis.get(key);
    return JSON.parse(result);
  } catch (error) {
    console.log('error get redis cache: ', error);
    return null;
  }
};
