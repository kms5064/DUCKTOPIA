CREATE TABLE IF NOT EXISTS users
(
    user_id          INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) UNIQUE,
    email           VARCHAR(255) UNIQUE,
    password        VARCHAR(255),
    is_logged_in    BOOL DEFAULT 0,
    create_dt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_dt       TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);