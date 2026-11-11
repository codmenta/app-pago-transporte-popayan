require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes'); // nuevo
const conductorRoutes = require('./routes/conductor.routes'); // nuevo
const busRoutes = require('./routes/bus.routes'); 
const turnoRoutes = require('./routes/turno.routes');
const pagoRoutes = require('./routes/pago.routes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', turnoRoutes);
app.use('/api', walletRoutes); // nuevo
app.use('/api', busRoutes); // nuevo
app.use('/api', conductorRoutes); // nuevo
app.use('/api', pagoRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

// Crea la tabla de pagos si no existe (init.sql solo corre con una base nueva)
pool
  .query(
    `CREATE TABLE IF NOT EXISTS pagos (
       id SERIAL PRIMARY KEY,
       correo_pasajero VARCHAR(150) NOT NULL,
       id_turno INTEGER NOT NULL,
       placa_bus VARCHAR(10) NOT NULL,
       correo_conductor VARCHAR(150) NOT NULL,
       monto NUMERIC(10, 2) NOT NULL,
       fecha TIMESTAMP DEFAULT NOW()
     )`
  )
  .catch((error) => console.error('Error creando tabla pagos:', error));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
