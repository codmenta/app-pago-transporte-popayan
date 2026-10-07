require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const conductorRoutes = require('./routes/conductor.routes'); 
const busRoutes = require('./routes/bus.routes'); 
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', walletRoutes);
app.use('/api', busRoutes); 
app.use('/api', conductorRoutes); 

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});