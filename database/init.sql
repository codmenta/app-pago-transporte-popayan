CREATE TABLE IF NOT EXISTS usuarios (
    correo VARCHAR(150) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    celular VARCHAR(10) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'pasajero',
    cedula VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billetera (
    correo VARCHAR(150) PRIMARY KEY,
    saldo NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    fecha TIMESTAMP DEFAULT NOW(),
    descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS buses (
    placa VARCHAR(10) PRIMARY KEY,
    numero_interno VARCHAR(10) NOT NULL,
    ruta VARCHAR(100) NOT NULL,
    codigo_qr VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    correo_conductor VARCHAR(150) NOT NULL,
    placa_bus VARCHAR(10) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo'
);