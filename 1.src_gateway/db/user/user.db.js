import pools from '../database.js';
import SQL_USER_QUERIES from './user.queries.js';

export const createUser = async (name, email, password) => {
  let connection;
  try {  
    connection = await pools.USER_DB.getConnection();  
    await connection.query(SQL_USER_QUERIES.CREATE_USER, [name, email, password]);
  } finally {
    if (connection) connection.release();
  }
};

export const findUserByEmail = async (email) => {
  let connection;
  let rows;
  try {  
    connection = await pools.USER_DB.getConnection();  
    [rows] = await connection.query(SQL_USER_QUERIES.FIND_USER_BY_EMAIL, [email]);
  } finally {
    if (connection) connection.release();
  }
  return rows[0];
};
