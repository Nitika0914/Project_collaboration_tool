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
const Project = require('./models/Project');
const TeamMember = require('./models/TeamMember');
const Task = require('./models/Task');
const JoinRequest = require('./models/JoinRequest');

// Associations
// User (manager) hasMany Team, Team belongsTo User (manager)
User.hasMany(Team, { foreignKey: 'managerId', as: 'managedTeams' });
Team.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// Team hasMany Project, Project belongsTo Team
Team.hasMany(Project, { foreignKey: 'teamId', as: 'projects' });
Project.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// User (manager) hasMany Project
User.hasMany(Project, { foreignKey: 'managerId', as: 'managedProjects' });
Project.belongsTo(User, { foreignKey: 'managerId', as: 'projectManager' });

// Team <-> User many-to-many via TeamMember
Team.belongsToMany(User, { through: TeamMember, foreignKey: 'teamId', otherKey: 'userId', as: 'members' });
User.belongsToMany(Team, { through: TeamMember, foreignKey: 'userId', otherKey: 'teamId', as: 'teams' });

// Project hasMany Task, Task belongsTo Project
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// JoinRequest associations
Team.hasMany(JoinRequest, { foreignKey: 'teamId', as: 'joinRequests' });
User.hasMany(JoinRequest, { foreignKey: 'userId', as: 'joinRequests' });
JoinRequest.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
JoinRequest.belongsTo(User, { foreignKey: 'userId', as: 'requester' });

sequelize.authenticate()
  .then(() => console.log("database connected successfully"))
  .then(() => sequelize.sync({ alter: true }))
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Failed to connect or sync db', err));

//routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const managerRoutes = require('./routes/manager');
app.use('/api/manager', managerRoutes);

const projectRoutes = require('./routes/project');
app.use('/api/projects', projectRoutes);

const teamRoutes = require('./routes/teams');
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
