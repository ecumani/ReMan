    create database reman;

   CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_no VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('Tenant', 'Landlord'))
);


CREATE TABLE Address (
    address_id SERIAL PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    property_no VARCHAR(10) 
);


CREATE TABLE Property (
    property_id SERIAL PRIMARY KEY,
    address_id INT REFERENCES Address(address_id) ON DELETE CASCADE,
    landlord_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    tenant_id INT REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE Payments (
    payment_id SERIAL PRIMARY KEY,
    property_id INT REFERENCES Property(property_id) ON DELETE CASCADE,
    rent DECIMAL(10, 2) DEFAULT 5000.00 NOT NULL,
    water_tax DECIMAL(10, 2) DEFAULT 200.00 NOT NULL,
    electricity_bill DECIMAL(10, 2) DEFAULT 300.00 NOT NULL,
    payment_month DATE NOT NULL,
    date_paid DATE,
    client_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    is_paid BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_month_payment UNIQUE (property_id, payment_month)
);
