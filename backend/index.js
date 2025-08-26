const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(express.json());

const sequelize = require('./config/database');
const User = require('./models/User');

const authRoutes = require('./routes/auth');

sequelize.authenticate()
   .then(()=> console.log("database connected successfully"))
   .then(()=> sequelize.sync({alter: true}))
   .then(()=> console.log('Database synced'))
   .catch(err => console.error('Failed to connect or sync db', err));

app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
