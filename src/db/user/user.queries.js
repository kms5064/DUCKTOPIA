const SQL_USER_QUERIES = {
  FIND_USER_BY_EMAIL:
    'SELECT userId, name, email, password, isLogin, create_dt, update_dt FROM user WHERE email = ?',
  CREATE_USER: 'INSERT INTO user (name, email, password) VALUES (?,?,?)',
  UPDATE_USER_LOGIN: 'UPDATE user SET isLogin = ?, updatd_dt = ? WHERE email = ?',
};

export default SQL_USER_QUERIES;
