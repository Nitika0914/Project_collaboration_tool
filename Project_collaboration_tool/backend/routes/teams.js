const express = require('express');
const router = express.Router();
const passport = require('passport');
const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');

// Middleware to authenticate JWT
const authenticate = passport.authenticate('jwt', { session: false });

// Get all teams for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get teams where user is manager
    const managedTeams = await Team.findAll({
      where: { managerId: userId },
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TeamMember,
          as: 'TeamMembers',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        }
      ]
    });

    // Get teams where user is a member (but not manager)
    const memberShips = await TeamMember.findAll({
      where: { userId: userId },
      include: [
        {
          model: Team,
          as: 'team',
          include: [
            {
              model: User,
              as: 'manager',
              attributes: ['id', 'name', 'email']
            },
            {
              model: TeamMember,
              as: 'TeamMembers',
              include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              }]
            }
          ]
        }
      ]
    });

    // Get member teams (exclude ones already in managedTeams)
    const managedTeamIds = managedTeams.map(t => t.id);
    const memberTeams = memberShips
      .map(m => m.team)
      .filter(t => t && !managedTeamIds.includes(t.id));

    // Combine teams
    const allTeams = [...managedTeams, ...memberTeams];

    res.json(allTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

// Create a new team (only managers/admins can create)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Creating team request:', { name, description, userId, userRole });

    // Check if user is a manager or admin
    if (userRole !== 'project_manager' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only managers can create teams' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // Create team
    const team = await Team.create({
      name,
      description: description || null,
      managerId: userId
    });

    console.log('Team created:', team.id);

    // Add creator as team member
    await TeamMember.create({
      teamId: team.id,
      userId: userId,
      role: 'manager'
    });

    console.log('TeamMember created');

    // Fetch team with relationships
    const createdTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TeamMember,
          as: 'TeamMembers',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        }
      ]
    });

    res.status(201).json(createdTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error creating team', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Join a team by team code/ID
router.post('/join', authenticate, async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user.id;

    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    // Check if team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is already a member
    const existingMember = await TeamMember.findOne({
      where: { teamId, userId }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'You are already a member of this team' });
    }

    // Add user as team member
    await TeamMember.create({
      teamId,
      userId,
      role: 'member'
    });

    // Fetch updated team
    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TeamMember,
          as: 'TeamMembers',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        }
      ]
    });

    res.status(200).json({ message: 'Successfully joined team', team: updatedTeam });
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ message: 'Error joining team', error: error.message });
  }
});

// Get team by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TeamMember,
          as: 'TeamMembers',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        }
      ]
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
});

module.exports = router;
