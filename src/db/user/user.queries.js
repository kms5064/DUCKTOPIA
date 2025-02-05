const SQL_USER_QUERIES = {
  FIND_USER_BY_EMAIL:
    'SELECT userId, name, email, password, isLogin, create_dt, update_dt FROM users WHERE email = ?',
  CREATE_USER: 'INSERT INTO users (name, email, password) VALUES (?,?,?)',
  UPDATE_USER_LOGIN: 'UPDATE users SET isLogin = ? WHERE email = ?',
};

export default SQL_USER_QUERIES;
