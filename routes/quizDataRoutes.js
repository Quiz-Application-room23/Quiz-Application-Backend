const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();
const QUIZDATA = process.env.QUIZDATA_TABLE || 'QuizData';

// Get all quizzes
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${QUIZDATA}`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get quiz by ID
router.get('/:quiz_id', (req, res) => {
  const sql = `SELECT * FROM ${QUIZDATA} WHERE quiz_id = ?`;
  db.query(sql, [req.params.quiz_id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult('Quiz not found'));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add new quiz
router.post('/', (req, res) => {
  const { quiz_name, quiz_Questions, mod_id, course_id, is_active } = req.body;

  if (!quiz_name || !mod_id || !course_id) {
    return res.status(400).send(createErrorResult("quiz_name, mod_id, and course_id are required."));
  }

  // quiz_Questions and is_active are optional, set defaults if needed
  const quizQuestionsVal = quiz_Questions || null;
  const isActiveVal = (typeof is_active === 'boolean') ? is_active : true;

  const sql = `INSERT INTO ${QUIZDATA} (quiz_name, quiz_Questions, mod_id, course_id, is_active) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [quiz_name, quizQuestionsVal, mod_id, course_id, isActiveVal], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(201).send(createSuccessResult({
      message: "Quiz created successfully.",
      quiz_id: result.insertId
    }));
  });
});

// Update quiz
router.put('/:quiz_id', (req, res) => {
  const { quiz_name, quiz_Questions, mod_id, course_id, is_active } = req.body;

  if (!quiz_name || !mod_id || !course_id) {
    return res.status(400).send(createErrorResult("quiz_name, mod_id, and course_id are required."));
  }

  const isActiveVal = (typeof is_active === 'boolean') ? is_active : true;

  const sql = `UPDATE ${QUIZDATA} SET quiz_name = ?, quiz_Questions = ?, mod_id = ?, course_id = ?, is_active = ? WHERE quiz_id = ?`;
  db.query(sql, [quiz_name, quiz_Questions, mod_id, course_id, isActiveVal, req.params.quiz_id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Quiz not found'));
    return res.status(200).send(createSuccessResult('Quiz updated successfully'));
  });
});

// Delete quiz
router.delete('/:quiz_id', (req, res) => {
  const quizId = req.params.quiz_id;

  const deleteQuizSql = `DELETE FROM QuizData WHERE quiz_id = ?`;
  db.query(deleteQuizSql, [quizId], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Quiz not found'));
    return res.status(200).send(createSuccessResult('Quiz deleted successfully'));
  });
});

module.exports = router;
