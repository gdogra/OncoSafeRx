import express from 'express';
import { TEAMS, TUMOR_BOARDS, CLINICAL_PATHWAYS } from '../data/collaboration.js';

const router = express.Router();

// Teams endpoints
router.get('/teams', (req, res) => {
  const { specialty, active } = req.query;
  let teams = [...TEAMS];

  if (specialty) {
    teams = teams.filter(team => 
      team.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  if (active !== undefined) {
    teams = teams.filter(team => team.isActive === (active === 'true'));
  }

  res.json({ count: teams.length, teams });
});

router.get('/teams/:id', (req, res) => {
  const team = TEAMS.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  res.json(team);
});

// Tumor boards endpoints
router.get('/tumor-boards', (req, res) => {
  const { teamId, active } = req.query;
  let boards = [...TUMOR_BOARDS];

  if (teamId) {
    boards = boards.filter(board => board.teamId === teamId);
  }

  if (active !== undefined) {
    boards = boards.filter(board => board.isActive === (active === 'true'));
  }

  res.json({ count: boards.length, tumorBoards: boards });
});

router.get('/tumor-boards/:id', (req, res) => {
  const board = TUMOR_BOARDS.find(b => b.id === req.params.id);
  if (!board) {
    return res.status(404).json({ error: 'Tumor board not found' });
  }
  res.json(board);
});

// Clinical pathways endpoints
router.get('/pathways', (req, res) => {
  const { cancerType, stage, active } = req.query;
  let pathways = [...CLINICAL_PATHWAYS];

  if (cancerType) {
    pathways = pathways.filter(pathway => 
      pathway.cancerType.toLowerCase().includes(cancerType.toLowerCase())
    );
  }

  if (stage) {
    pathways = pathways.filter(pathway => 
      pathway.stage.toLowerCase().includes(stage.toLowerCase())
    );
  }

  if (active !== undefined) {
    pathways = pathways.filter(pathway => pathway.isActive === (active === 'true'));
  }

  res.json({ count: pathways.length, pathways });
});

router.get('/pathways/:id', (req, res) => {
  const pathway = CLINICAL_PATHWAYS.find(p => p.id === req.params.id);
  if (!pathway) {
    return res.status(404).json({ error: 'Clinical pathway not found' });
  }
  res.json(pathway);
});

// Get upcoming tumor board meetings
router.get('/meetings/upcoming', (req, res) => {
  const now = new Date();
  const upcomingMeetings = TUMOR_BOARDS
    .filter(board => board.isActive && new Date(board.nextMeeting) > now)
    .map(board => ({
      id: board.id,
      name: board.name,
      nextMeeting: board.nextMeeting,
      schedule: board.schedule,
      caseCount: board.cases.length,
      teamId: board.teamId
    }))
    .sort((a, b) => new Date(a.nextMeeting).getTime() - new Date(b.nextMeeting).getTime());

  res.json({ count: upcomingMeetings.length, meetings: upcomingMeetings });
});

// Get team members by specialty
router.get('/members/specialty/:specialty', (req, res) => {
  const specialty = req.params.specialty.toLowerCase();
  const members = [];

  TEAMS.forEach(team => {
    team.members.forEach(member => {
      if (member.specialization.toLowerCase().includes(specialty) ||
          member.role.toLowerCase().includes(specialty)) {
        members.push({
          ...member,
          teamId: team.id,
          teamName: team.name
        });
      }
    });
  });

  res.json({ count: members.length, members });
});

// Get filter options
router.get('/filters/options', (req, res) => {
  const specialties = [...new Set(TEAMS.map(t => t.specialty))].sort();
  const cancerTypes = [...new Set(CLINICAL_PATHWAYS.map(p => p.cancerType))].sort();
  const stages = [...new Set(CLINICAL_PATHWAYS.map(p => p.stage))].sort();
  const roles = [...new Set(TEAMS.flatMap(t => t.members.map(m => m.role)))].sort();

  res.json({
    specialties,
    cancerTypes,
    stages,
    roles
  });
});

export default router;