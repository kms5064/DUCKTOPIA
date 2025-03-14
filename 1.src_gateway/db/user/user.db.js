import pools from '../database.js';
import SQL_USER_QUERIES from './user.queries.js';

export const createUser = async (name, email, password) => {
  await pools.USER_DB.query(SQL_USER_QUERIES.CREATE_USER, [name, email, password]);
};

export const findUserByEmail = async (email) => {
  const [rows] = await pools.USER_DB.query(SQL_USER_QUERIES.FIND_USER_BY_EMAIL, [email]);
  return rows[0];
};
