const SQL_USER_QUERIES = {
  FIND_USER_BY_EMAIL:
    'SELECT id, name, email, password FROM users WHERE email = ?',
  CREATE_USER: 'INSERT INTO users (name, email, password) VALUES (?,?,?)',
  FIND_ALL_USER : 'SELECT * FROM users'
};

export default SQL_USER_QUERIES;
