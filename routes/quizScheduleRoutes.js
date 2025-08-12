const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();

const QUIZ_SCHEDULE = process.env.QUIZ_SCHEDULE_TABLE || 'QuizSchedule';
const QUIZ_DATA = process.env.QUIZDATA_TABLE || 'QuizData';
const MODULE = process.env.MODULE_TABLE || 'Module';

// Helper to check if quiz_id exists
function checkQuizExists(quiz_id) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT 1 FROM ${QUIZ_DATA} WHERE quiz_id = ?`;
    db.query(sql, [quiz_id], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
}

// Helper to check if mod_id exists
function checkModuleExists(mod_id) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT 1 FROM ${MODULE} WHERE mod_id = ?`;
    db.query(sql, [mod_id], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
}

// Get all quiz schedules
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${QUIZ_SCHEDULE}`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get schedule by ID
router.get('/:schedule_id', (req, res) => {
  const sql = `SELECT * FROM ${QUIZ_SCHEDULE} WHERE schedule_id = ?`;
  db.query(sql, [req.params.schedule_id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult('Schedule not found'));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add new schedule
router.post('/', async (req, res) => {
  try {
    const { quiz_id, mod_id, quiz_date, quiz_time, duration_minutes } = req.body;

    if (!quiz_id || !mod_id || !quiz_date || !quiz_time || !duration_minutes) {
      return res.status(400).send(createErrorResult('quiz_id, mod_id, quiz_date, quiz_time, and duration_minutes are required'));
    }

    const quizExists = await checkQuizExists(quiz_id);
    if (!quizExists) return res.status(400).send(createErrorResult(`Quiz with id ${quiz_id} does not exist`));

    const modExists = await checkModuleExists(mod_id);
    if (!modExists) return res.status(400).send(createErrorResult(`Module with id ${mod_id} does not exist`));

    const sql = `INSERT INTO ${QUIZ_SCHEDULE} (quiz_id, mod_id, quiz_date, quiz_time, duration_minutes) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [quiz_id, mod_id, quiz_date, quiz_time, duration_minutes], (err, result) => {
      if (err) return res.status(500).send(createErrorResult(err));
      return res.status(201).send(createSuccessResult({
        message: 'Quiz schedule created successfully',
        schedule_id: result.insertId
      }));
    });
  } catch (error) {
    return res.status(500).send(createErrorResult(error));
  }
});

// Update schedule
router.put('/:schedule_id', async (req, res) => {
  try {
    const { quiz_id, mod_id, quiz_date, quiz_time, duration_minutes } = req.body;

    if (!quiz_id || !mod_id || !quiz_date || !quiz_time || !duration_minutes) {
      return res.status(400).send(createErrorResult('quiz_id, mod_id, quiz_date, quiz_time, and duration_minutes are required'));
    }

    const quizExists = await checkQuizExists(quiz_id);
    if (!quizExists) return res.status(400).send(createErrorResult(`Quiz with id ${quiz_id} does not exist`));

    const modExists = await checkModuleExists(mod_id);
    if (!modExists) return res.status(400).send(createErrorResult(`Module with id ${mod_id} does not exist`));

    const sql = `UPDATE ${QUIZ_SCHEDULE} SET quiz_id = ?, mod_id = ?, quiz_date = ?, quiz_time = ?, duration_minutes = ? WHERE schedule_id = ?`;
    db.query(sql, [quiz_id, mod_id, quiz_date, quiz_time, duration_minutes, req.params.schedule_id], (err, result) => {
      if (err) return res.status(500).send(createErrorResult(err));
      if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Schedule not found'));
      return res.status(200).send(createSuccessResult('Quiz schedule updated successfully'));
    });
  } catch (error) {
    return res.status(500).send(createErrorResult(error));
  }
});

// Delete schedule
router.delete('/:schedule_id', (req, res) => {
  const sql = `DELETE FROM ${QUIZ_SCHEDULE} WHERE schedule_id = ?`;
  db.query(sql, [req.params.schedule_id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Schedule not found'));
    return res.status(200).send(createSuccessResult('Quiz schedule deleted successfully'));
  });
});

module.exports = router;
