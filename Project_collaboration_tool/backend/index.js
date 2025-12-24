const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

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
const Team = require('./models/Team');
const TeamMember = require('./models/TeamMember');

// Define relationships after all models are loaded
Team.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
User.hasMany(Team, { foreignKey: 'managerId', as: 'managedTeams' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'TeamMembers' });
User.hasMany(TeamMember, { foreignKey: 'userId', as: 'teamMemberships' });

sequelize.authenticate()
  .then(() => console.log("database connected successfully"))
  .then(() => sequelize.sync({ alter: true }))
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Failed to connect or sync db', err));

//routes
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

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

