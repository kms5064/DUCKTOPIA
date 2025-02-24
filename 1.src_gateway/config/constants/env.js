import dotenv from 'dotenv';

dotenv.config();

// export const PORT = process.env.PORT || 5556;
export const PORT = 5555;
export const HOST = process.env.HOST || 'localhost';
export const CLIENT_VERSION = process.env.CLIENT_VERSION || '1.0.0';
// 클라에서 0.2초마다 이동요청 패킷을 보냄
export const LOCATION_REQ_TIME_TERM = process.env.LOCATION_REQ_TIME_TERM || 2000;

export const DB_NAME = process.env.DB_NAME || 'database';
export const DB_USER = process.env.DB_USER || 'user';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 3306;

export const REDIS_USER = process.env.REDIS_USER || 'user';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'password';
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || 6379;
