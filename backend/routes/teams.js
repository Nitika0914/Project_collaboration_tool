const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const Team = require('../models/Team');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const JoinRequest = require('../models/JoinRequest');

const router = express.Router();

// List all teams (basic discovery). Optional search by name via ?q=
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const where = q ? { name: { [Op.iLike]: `%${q}%` } } : undefined;
    const teams = await Team.findAll({ where, include: [{ model: User, as: 'manager', attributes: ['id', 'name'] }] });
    return res.json({ teams });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List my teams (as member)
router.get('/mine', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const memberships = await TeamMember.findAll({ where: { userId: req.user.id } });
    const teamIds = memberships.map((m) => m.teamId);
    const teams = teamIds.length ? await Team.findAll({ where: { id: { [Op.in]: teamIds } } }) : [];
    return res.json({ teams });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List my join requests and statuses
router.get('/requests/mine', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const requests = await JoinRequest.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a join request
router.post('/:teamId/join', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { teamId } = req.params;
    // Check if already a member
    const existingMember = await TeamMember.findOne({ where: { teamId, userId: req.user.id } });
    if (existingMember) return res.status(400).json({ message: 'Already a member' });

    // Check existing pending request
    const existing = await JoinRequest.findOne({ where: { teamId, userId: req.user.id, status: 'pending' } });
    if (existing) return res.status(400).json({ message: 'Join request already pending' });

    const jr = await JoinRequest.create({ teamId, userId: req.user.id, status: 'pending' });
    return res.status(201).json({ request: jr });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel my pending join request
router.delete('/:teamId/join', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { teamId } = req.params;
    const deleted = await JoinRequest.destroy({ where: { teamId, userId: req.user.id, status: 'pending' } });
    if (!deleted) return res.status(404).json({ message: 'No pending request found' });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manager: list pending join requests for my teams
router.get('/requests/pending', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'project_manager') return res.status(403).json({ message: 'Forbidden' });

    const myTeams = await Team.findAll({ where: { managerId: req.user.id } });
    const teamIds = myTeams.map((t) => t.id);
    const requests = teamIds.length ? await JoinRequest.findAll({
      where: { teamId: { [Op.in]: teamIds }, status: 'pending' },
      include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'email'] }, { model: Team, as: 'team' }],
      order: [['createdAt', 'DESC']],
    }) : [];

    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manager: approve or reject a join request
router.post('/requests/:requestId/:action', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'project_manager') return res.status(403).json({ message: 'Forbidden' });
    const { requestId, action } = req.params;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

    const request = await JoinRequest.findByPk(requestId);
    if (!request || request.status !== 'pending') return res.status(404).json({ message: 'Pending request not found' });

    // verify manager owns the team
    const team = await Team.findByPk(request.teamId);
    if (!team || team.managerId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (action === 'approve') {
      await TeamMember.create({ teamId: request.teamId, userId: request.userId });
      await request.update({ status: 'approved' });
    } else {
      await request.update({ status: 'rejected' });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 