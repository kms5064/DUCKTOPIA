import pools from '../database.js';
import SQL_USER_QUERIES from './user.queries.js';

export const createUser = async (name, email, password) => {
  await pools.USER_DB.query(SQL_USER_QUERIES.CREATE_USER, [name, email, password]);
};

export const findUserByEmail = async (email) => {
  const [rows] = await pools.USER_DB.query(SQL_USER_QUERIES.FIND_USER_BY_EMAIL, [email]);
  return rows[0];
};

// TODO 쓸 일이 있을까?
export const transaction = async (callback) => {
  try {
    await pools.USER_DB.beginTransaction();
    await callback();
    await pools.USER_DB.commit();
  } catch (error) {
    await pools.USER_DB.rollback();
    throw error;
  } finally {
    pools.USER_DB.releaseConnection();
  }
};

export const FindAllUser = async () => {
  const [rows] = await pools.USER_DB.query(SQL_USER_QUERIES.FIND_ALL_USER, []);
}
