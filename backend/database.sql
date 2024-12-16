    create database reman;

   CREATE TABLE "User" (
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
    zip_code VARCHAR(10) NOT NULL
);

CREATE TABLE Tenant (
    tenant_id INT PRIMARY KEY REFERENCES "User"(user_id) ON DELETE CASCADE,
    address_id INT REFERENCES Address(address_id) ON DELETE SET NULL
);

CREATE TABLE Landlord (
    landlord_id INT PRIMARY KEY REFERENCES "User"(user_id) ON DELETE CASCADE,
    address_id INT REFERENCES Address(address_id) ON DELETE SET NULL
);

CREATE TABLE Property (
    property_id SERIAL PRIMARY KEY,
    address_id INT REFERENCES Address(address_id) ON DELETE CASCADE,
    landlord_id INT REFERENCES Landlord(landlord_id) ON DELETE CASCADE,
    tenant_id INT REFERENCES Tenant(tenant_id) ON DELETE SET NULL
);
