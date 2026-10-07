-- Ejecutar en la base de datos "popapay"

CREATE TABLE Usuarios (
    correo         VARCHAR(150) PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    celular        VARCHAR(10)  NOT NULL,
    contrasena     VARCHAR(255) NOT NULL,
    rol            VARCHAR(20)  NOT NULL DEFAULT 'usuario',
    cedula         VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Billetera (
    correo VARCHAR(150) PRIMARY KEY,
    saldo  NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE Movimientos (
    id          SERIAL PRIMARY KEY,
    tipo        VARCHAR(20)  NOT NULL,
    correo      VARCHAR(150) NOT NULL,
    monto       NUMERIC(10, 2) NOT NULL,
    fecha       TIMESTAMP DEFAULT NOW(),
    descripcion VARCHAR(255)
);

CREATE TABLE Buses (
    placa          VARCHAR(20)  PRIMARY KEY,
    numero_interno VARCHAR(20)  NOT NULL,
    ruta           VARCHAR(150) NOT NULL,
    codigo_qr      VARCHAR(200) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Usuarios de prueba (contraseñas en texto plano, solo para desarrollo)
INSERT INTO Usuarios (correo, nombre, celular, contrasena, rol) VALUES
('admin@popapay.com',   'Administrador',  '3000000000', 'admin123',   'admin'),
('usuario@popapay.com', 'Usuario Prueba', '3111111111', 'usuario123', 'usuario');

INSERT INTO Billetera (correo, saldo) VALUES ('usuario@popapay.com', 0);
