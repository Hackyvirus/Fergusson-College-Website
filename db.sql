CREATE USER hacky WITH PASSWORD '3XhtsXaG0L6ycK3rEyrEBKZwgD7aZKIb';

CREATE DATABASE hacky;

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    roll_no INT,
    email_id VARCHAR(30),
    phone_no BIGINT,
    dob DATE,
    class VARCHAR(10),
    password VARCHAR (30)
)

CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    email_id VARCHAR(30),
    phone_no BIGINT,
    dob DATE,
    password VARCHAR (30)

)
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    email_id VARCHAR(30),
    dob DATE,
    phone_no BIGINT,
    password VARCHAR (30)
)

CREATE TABLE alumni (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    email_id VARCHAR(30),
    phone_no BIGINT,
    dob DATE,
    password VARCHAR (30)
)

CREATE TABLE materials (email_id VARCHAR(30),material VARCHAR(250),class VARCHAR(10),name VARCHAR(250));
CREATE TABLE notices (
    email_id VARCHAR(30),
    notice VARCHAR(250),
    class VARCHAR(10)
);