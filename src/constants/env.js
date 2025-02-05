import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5555;
export const HOST = process.env.HOST || 'localhost';
export const CLIENT_VERSION = process.env.CLIENT_VERSION || '1.0.0';

export const DB_NAME = process.env.DB1_NAME || 'database';
export const DB_USER = process.env.DB1_USER || 'user';
export const DB_PASSWORD = process.env.DB1_PASSWORD || 'password';
export const DB_HOST = process.env.DB1_HOST || 'localhost';
export const DB_PORT = process.env.DB1_PORT || 3306;
