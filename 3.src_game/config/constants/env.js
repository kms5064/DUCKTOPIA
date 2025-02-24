import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5558;
// export const PORT = 5558;
export const HOST = process.env.HOST || '127.0.0.1';
export const CLIENT_VERSION = process.env.CLIENT_VERSION || '1.0.0';
// 클라에서 0.2초마다 이동요청 패킷을 보냄
export const LOCATION_REQ_TIME_TERM = process.env.LOCATION_REQ_TIME_TERM || 2000;

export const DB_NAME = process.env.DB_NAME || 'database';
export const DB_USER = process.env.DB_USER || 'user';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 3306;
