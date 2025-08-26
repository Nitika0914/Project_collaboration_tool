const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

//database
const sequelize = require('./config/database');
const User = require('./models/User');

sequelize.authenticate()
  .then(() => console.log("database connected successfully"))
  .then(() => sequelize.sync({ alter: true }))
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Failed to connect or sync db', err));

//routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/api/protected', 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    res.json({ message: 'Authenticated user', user: req.user });
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
