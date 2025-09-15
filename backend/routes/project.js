const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const User = require('../models/User');
const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();

async function canAccessProject(userId, projectId) {
  const project = await Project.findByPk(projectId, { include: [{ model: Team, as: 'team' }] });
  if (!project) return { ok: false, status: 404, message: 'Project not found' };

  // Manager of project
  if (project.managerId === userId) return { ok: true, project };

  // Member of the project team
  const membership = await TeamMember.findOne({ where: { teamId: project.teamId, userId } });
  if (membership) return { ok: true, project };

  return { ok: false, status: 403, message: 'Forbidden' };
}

// List projects accessible by current user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    let projects = [];

    if (req.user.role === 'project_manager') {
      projects = await Project.findAll({ where: { managerId: userId }, order: [['createdAt', 'DESC']] });
    } else {
      const memberships = await TeamMember.findAll({ where: { userId } });
      const teamIds = memberships.map((m) => m.teamId);
      if (teamIds.length) {
        projects = await Project.findAll({ where: { teamId: { [Op.in]: teamIds } }, order: [['createdAt', 'DESC']] });
      }
    }

    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get project details and tasks
router.get('/:projectId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { projectId } = req.params;
    const check = await canAccessProject(req.user.id, projectId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const project = await Project.findByPk(projectId, {
      include: [
        { model: Team, as: 'team', include: [{ model: User, as: 'members' }, { model: User, as: 'manager', attributes: ['id', 'name', 'email'] }] },
        { model: Task, as: 'tasks' },
      ],
    });
    return res.json({ project });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create task
router.post('/:projectId/tasks', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, assignedTo } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const check = await canAccessProject(req.user.id, projectId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    // Optional: verify assignedTo is a member of the project team
    if (assignedTo) {
      const isMember = await TeamMember.findOne({ where: { teamId: check.project.teamId, userId: assignedTo } });
      if (!isMember) return res.status(400).json({ message: 'assignedTo must be a team member' });
    }

    const task = await Task.create({ projectId, title, createdBy: req.user.id, assignedTo: assignedTo || null });
    return res.status(201).json({ task });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task status
router.patch('/:projectId/tasks/:taskId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status, title, assignedTo } = req.body;
    const check = await canAccessProject(req.user.id, projectId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const task = await Task.findOne({ where: { id: taskId, projectId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (status && !['todo', 'in_progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (assignedTo) {
      const isMember = await TeamMember.findOne({ where: { teamId: check.project.teamId, userId: assignedTo } });
      if (!isMember) return res.status(400).json({ message: 'assignedTo must be a team member' });
    }

    await task.update({ status: status || task.status, title: title || task.title, assignedTo: assignedTo ?? task.assignedTo });
    return res.json({ task });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task
router.delete('/:projectId/tasks/:taskId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const check = await canAccessProject(req.user.id, projectId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const deleted = await Task.destroy({ where: { id: taskId, projectId } });
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 