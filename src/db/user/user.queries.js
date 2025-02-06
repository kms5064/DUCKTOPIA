const SQL_USER_QUERIES = {
  FIND_USER_BY_EMAIL:
    'SELECT user_id, name, email, password, create_dt, update_dt FROM users WHERE email = ?',
  CREATE_USER: 'INSERT INTO users (name, email, password) VALUES (?,?,?)',
};

export default SQL_USER_QUERIES;
