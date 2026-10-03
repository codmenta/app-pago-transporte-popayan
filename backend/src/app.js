require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes'); // nuevo
const conductorRoutes = require('./routes/conductor.routes'); // nuevo
const busRoutes = require('./routes/bus.routes'); 
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', walletRoutes); // nuevo
app.use('/api', busRoutes); // nuevo
app.use('/api', conductorRoutes); // nuevo

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});