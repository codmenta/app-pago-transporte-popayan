create table Usuarios(
    correo varchar(150)primary key,
    nombre varchar(100)NOT NULL,
    celular  varchar(10)NOT NULL,
    contrasena varchar(255)Not null,
    fecha_registro timestamp default now()

);
create table Billetera(
    correo VARCHAR(150) PRIMARY KEY,
    saldo NUMERIC(10, 2) NOT NULL DEFAULT 0 
);
create table Movimientos(
    id SERIAL PRIMARY KEY, 
    tipo VARCHAR(20) NOT NULL,
    correo VARCHAR(150) NOT NULL, 
    monto NUMERIC(10, 2) NOT NULL,
    fecha TIMESTAMP DEFAULT NOW(),
    descripcion VARCHAR(255)
);













    