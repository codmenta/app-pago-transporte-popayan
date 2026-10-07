# PopaPay – Backend

API REST en **Node.js + Express + PostgreSQL** para una billetera de transporte público: login, billetera/recargas, registro de conductores y generación de códigos QR para buses.

---

## 1. Requisitos previos

| Herramienta | Versión recomendada | Para qué |
|---|---|---|
| Node.js | 18 o superior (20 LTS ideal) | Express 5 y `fetch` nativo (usado en `test-qr.js`) |
| npm | Viene con Node | Instalar dependencias |
| PostgreSQL | 13 o superior | Base de datos |
| pgAdmin o `psql` | Cualquiera | Ejecutar el SQL |

Verifica versiones:

```bash
node -v
npm -v
psql --version
```

---

## 2. Estructura de carpetas

Los archivos importan unos de otros con rutas como `./routes/auth.routes` y `../controllers/auth.controller`, por lo que **los nombres y carpetas deben ser exactamente estos** (con puntos, no guiones bajos):

```
backend/
├── app.js
├── db.js
├── package.json
├── test-qr.js
├── .env                      <- (se crea a mano, ver paso 4)
├── controllers/
│   ├── auth.controller.js
│   ├── bus.controller.js
│   ├── conductor.controller.js
│   └── wallet.controller.js
└── routes/
    ├── auth.routes.js
    ├── bus.routes.js
    ├── conductor.routes.js
    └── wallet.routes.js
```

> ⚠️ Si descargaste los archivos como `auth_controller.js`, `auth_routes.js`, `_env`, etc., renómbralos: `auth.controller.js`, `auth.routes.js`, `.env`.

---

## 3. Instalar dependencias

Desde la carpeta `backend/`:

```bash
npm install
```

Esto instala: `express`, `cors`, `pg`, `dotenv`, `bcryptjs`, `qrcode`.

*(Opcional)* Agrega un script de arranque en `package.json`:

```json
{
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": { "...": "..." }
}
```

---

## 4. Configurar variables de entorno

Crea un archivo llamado **`.env`** (con el punto) en la raíz de `backend/`:

```env
PORT=4000
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=popapay
```

- `PORT=4000` es importante: `test-qr.js` llama a `http://localhost:4000`. Si no defines `PORT`, el servidor usa 3000.
- **Nunca subas `.env` a Git.** Agrégalo a `.gitignore`.

---

## 5. Crear la base de datos y las tablas

### 5.1 Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE popapay;"
```

(o créala desde pgAdmin con el nombre `popapay`).

### 5.2 Crear las tablas

El archivo `tablas.sql` **está incompleto**: no incluye la columna `rol`, la columna `cedula` ni la tabla `buses`, y el código las usa. Ejecuta esto completo en la base `popapay`:

```sql
-- Usuarios (con rol y cédula, requeridos por login y conductores)
CREATE TABLE Usuarios (
    correo         VARCHAR(150) PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    celular        VARCHAR(10)  NOT NULL,
    contrasena     VARCHAR(255) NOT NULL,
    rol            VARCHAR(20)  NOT NULL DEFAULT 'usuario',
    cedula         VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Billetera
CREATE TABLE Billetera (
    correo VARCHAR(150) PRIMARY KEY,
    saldo  NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Movimientos
CREATE TABLE Movimientos (
    id          SERIAL PRIMARY KEY,
    tipo        VARCHAR(20)  NOT NULL,
    correo      VARCHAR(150) NOT NULL,
    monto       NUMERIC(10, 2) NOT NULL,
    fecha       TIMESTAMP DEFAULT NOW(),
    descripcion VARCHAR(255)
);

-- Buses (tabla que faltaba)
CREATE TABLE Buses (
    placa          VARCHAR(20)  PRIMARY KEY,
    numero_interno VARCHAR(20)  NOT NULL,
    ruta           VARCHAR(150) NOT NULL,
    codigo_qr      VARCHAR(200) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

> Si ya tenías la tabla `Usuarios` creada con el `tablas.sql` original, en lugar de recrearla ejecuta:
> ```sql
> ALTER TABLE Usuarios ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'usuario';
> ALTER TABLE Usuarios ADD COLUMN cedula VARCHAR(20);
> ```

### 5.3 Insertar usuarios de prueba

No existe endpoint de registro, así que crea los usuarios a mano. Las contraseñas se guardan y comparan en **texto plano** (ver sección 9).

```sql
INSERT INTO Usuarios (correo, nombre, celular, contrasena, rol) VALUES
('admin@popapay.com',   'Administrador', '3000000000', 'admin123',   'admin'),
('usuario@popapay.com', 'Usuario Prueba','3111111111', 'usuario123', 'usuario');
```

---

## 6. Ejecutar el servidor

```bash
node app.js
# o, si agregaste el script:
npm start
```

Debes ver:

```
Servidor corriendo en http://localhost:4000
```

Prueba rápida en el navegador: `http://localhost:4000/` → `{"mensaje":"API funcionando"}`

---

## 7. Endpoints

Todas las rutas llevan el prefijo `/api`.

| Método | Ruta | Descripción | Body / Params |
|---|---|---|---|
| POST | `/api/login` | Inicia sesión | `{ "email", "password" }` |
| POST | `/api/registro` | Registra un pasajero (crea también su billetera en 0) | `{ "fullName", "email", "phone", "password" }` |
| GET | `/api/billetera/:correo` | Saldo y movimientos del usuario | `:correo` en la URL |
| POST | `/api/recargar` | Recarga saldo | `{ "correo", "monto" }` |
| POST | `/api/conductores` | Crea un conductor | `{ "nombre", "cedula", "celular", "correo", "password" }` |
| GET | `/api/conductores` | Lista conductores | – |
| POST | `/api/buses` | Crea un bus y devuelve su QR | `{ "placa", "numero_interno", "ruta" }` |
| GET | `/api/buses` | Lista buses | – |

### Ejemplos con curl

```bash
# Login
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@popapay.com","password":"admin123"}'

# Recargar saldo
curl -X POST http://localhost:4000/api/recargar \
  -H "Content-Type: application/json" \
  -d '{"correo":"usuario@popapay.com","monto":20000}'

# Consultar billetera
curl http://localhost:4000/api/billetera/usuario@popapay.com

# Crear conductor
curl -X POST http://localhost:4000/api/conductores \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","cedula":"1234567890","celular":"3123456789","correo":"juan@popapay.com","password":"conductor123"}'

# Crear bus (devuelve qrImage en base64)
curl -X POST http://localhost:4000/api/buses \
  -H "Content-Type: application/json" \
  -d '{"placa":"ABC-123","numero_interno":"101","ruta":"Centro - Norte"}'
```

### Respuestas importantes

- `200/201` → OK
- `400` → faltan campos obligatorios
- `401` → credenciales incorrectas (login)
- `409` → ya existe (correo de conductor o placa de bus duplicada)
- `500` → error interno (revisa la consola del servidor)

---

## 8. Probar la generación de QR

Con el servidor **ya corriendo** (en otra terminal):

```bash
node test-qr.js
```

Esto crea un bus de prueba (`XYZ-999`) y guarda la imagen en `qr-generado.png`. El QR contiene un texto con el formato:

```
POPAPAY-BUS-<NUMERO_INTERNO>-<PLACA>
```

Ejemplo: `POPAPAY-BUS-200-XYZ-999`

> Si ejecutas `test-qr.js` dos veces dará error `409` porque la placa ya existe. Cambia la placa o borra el bus:
> `DELETE FROM Buses WHERE placa = 'XYZ-999';`

---

## 9. Problemas comunes

| Error | Causa | Solución |
|---|---|---|
| `Cannot find module './routes/auth.routes'` | Archivos mal nombrados o fuera de carpeta | Revisar la estructura de la sección 2 |
| `password authentication failed for user` | Datos incorrectos en `.env` | Corregir `DB_USER` / `DB_PASSWORD` |
| `database "popapay" does not exist` | No se creó la BD | Paso 5.1 |
| `relation "buses" does not exist` | Falta la tabla `Buses` | Paso 5.2 |
| `column "rol" does not exist` | `Usuarios` creada con el SQL viejo | Ejecutar los `ALTER TABLE` del paso 5.2 |
| `ECONNREFUSED` en `test-qr.js` | Servidor apagado o puerto distinto | Iniciar `node app.js` y revisar `PORT=4000` |
| `fetch is not defined` | Node menor a 18 | Actualizar Node |
| `EADDRINUSE` | Puerto ocupado | Cambiar `PORT` en `.env` |

---

## 10. Pendientes / mejoras recomendadas

Estas cosas funcionan pero **no son seguras para producción**:

1. **Contraseñas en texto plano.** `bcryptjs` está instalado pero no se usa. Hay que hashear con `bcrypt.hash()` al crear conductores y comparar con `bcrypt.compare()` en el login.
2. **Sin autenticación en las rutas.** Cualquiera puede crear buses/conductores o recargar saldo de otro usuario. Falta JWT o sesiones y verificar el rol `admin`.
4. **Recarga sin validar usuario:** `/api/recargar` crea billetera para cualquier correo, incluso si no existe en `Usuarios`. Agregar llaves foráneas (`REFERENCES Usuarios(correo)`).
5. **Recarga sin transacción:** el saldo y el movimiento se guardan en consultas separadas; usar `BEGIN/COMMIT`.
6. Falta el cobro del pasaje al escanear el QR (el QR ya se genera, pero no hay endpoint que lo procese).
7. Agregar `.gitignore` con `node_modules/` y `.env`.

---

## 11. Resumen rápido (checklist)

- [ ] Instalar Node 18+ y PostgreSQL
- [ ] Ordenar carpetas `controllers/` y `routes/` con nombres con punto
- [ ] `npm install`
- [ ] Crear `.env` con `PORT=4000` y datos de la BD
- [ ] Crear base `popapay`
- [ ] Ejecutar el SQL completo (incluye `rol`, `cedula` y `Buses`)
- [ ] Insertar usuario admin de prueba
- [ ] `node app.js`
- [ ] Probar con curl/Postman y `node test-qr.js`

---

## 12. Frontend (app móvil con Expo)

Carpeta `frontend/`. Requiere el backend corriendo.

```bash
cd frontend
npm install
cp .env.example .env      # y editar EXPO_PUBLIC_API_URL con la IP de tu PC
npx expo start -c
```

- Celular real (Expo Go): celular y PC en la misma red WiFi. `EXPO_PUBLIC_API_URL=http://192.168.1.15:4000/api`
- Emulador Android: no necesita `.env` (usa `10.0.2.2`).
- Si el celular no conecta, permite el puerto 4000 en el firewall de Windows.

Roles: `admin` ve registro de buses/conductores, `conductor` ve un panel temporal y `usuario` ve billetera y recarga.
