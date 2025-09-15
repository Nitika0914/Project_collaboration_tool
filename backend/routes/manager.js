const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');

const router = express.Router();

// Middleware to ensure user is project_manager
function requireManager(req, res, next) {
  if (!req.user || req.user.role !== 'project_manager') {
    return res.status(403).json({ message: 'Forbidden: Managers only' });
  }
  next();
}

// Create a new project (manager only)
router.post('/projects',
  passport.authenticate('jwt', { session: false }),
  requireManager,
  async (req, res) => {
    try {
      const { name, description, teamId } = req.body;
      if (!name || !teamId) {
        return res.status(400).json({ message: 'name and teamId are required' });
      }

      // Ensure the team belongs to this manager
      const team = await Team.findOne({ where: { id: teamId, managerId: req.user.id } });
      if (!team) {
        return res.status(404).json({ message: 'Team not found or not managed by you' });
      }

      const project = await Project.create({
        name,
        description: description || null,
        status: 'in_progress',
        teamId: team.id,
        managerId: req.user.id,
      });

      return res.status(201).json({ project });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// List manager's teams currently working on a project (active projects)
router.get('/teams-with-projects',
  passport.authenticate('jwt', { session: false }),
  requireManager,
  async (req, res) => {
    try {
      const teams = await Team.findAll({
        where: { managerId: req.user.id },
        include: [{
          model: Project,
          as: 'projects',
          where: { status: { [Op.in]: ['planned', 'in_progress'] } },
          required: true,
          order: [['createdAt', 'DESC']],
        }],
        order: [['name', 'ASC']],
      });

      return res.json({ teams });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Create a new team with members (manager only)
router.post('/teams',
  passport.authenticate('jwt', { session: false }),
  requireManager,
  async (req, res) => {
    try {
      const { name, members } = req.body; // members: [{ name, email, mobile }]
      if (!name) {
        return res.status(400).json({ message: 'Team name is required' });
      }

      const team = await Team.create({ name, managerId: req.user.id });

      // Optionally create or attach users as team members
      if (Array.isArray(members) && members.length > 0) {
        for (const m of members) {
          if (!m.email || !m.name || !m.mobile) {
            continue; // skip incomplete
          }
          let user = await User.findOne({ where: { email: m.email } });
          if (!user) {
            // create a basic user with a temp password; in real app, send invite
            const tempPassword = Math.random().toString(36).slice(2, 10);
            const hashed = await bcrypt.hash(tempPassword, 10);
            user = await User.create({
              name: m.name,
              email: m.email,
              password: hashed,
              mobile: m.mobile,
              role: 'team_member',
            });
          }
          await TeamMember.create({ teamId: team.id, userId: user.id, roleInTeam: m.roleInTeam || null });
        }
      }

      const created = await Team.findByPk(team.id, { include: [{ model: User, as: 'members' }] });
      return res.status(201).json({ team: created });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// List all manager teams (with members)
router.get('/teams',
  passport.authenticate('jwt', { session: false }),
  requireManager,
  async (req, res) => {
    try {
      const teams = await Team.findAll({
        where: { managerId: req.user.id },
        include: [{ model: User, as: 'members' }],
        order: [['name', 'ASC']],
      });
      return res.json({ teams });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router; 