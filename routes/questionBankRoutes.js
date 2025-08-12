const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();
const QUESTION_BANK = process.env.QUESTIONBANK_TABLE || 'QuestionBank';

// Get all questions
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${QUESTION_BANK} WHERE is_active = 1`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get question by ID
router.get('/:id', (req, res) => {
  const sql = `SELECT * FROM ${QUESTION_BANK} WHERE question_id = ? AND is_active = 1`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult('Question not found'));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add new question
router.post('/', (req, res) => {
  const { question_text, choice1, choice2, choice3, choice4, correct_choice } = req.body;

  if (!question_text || !correct_choice) {
    return res.status(400).send(createErrorResult('Question text and correct choice are required.'));
  }

  const sql = `INSERT INTO ${QUESTION_BANK} 
    (question_text, choice1, choice2, choice3, choice4, correct_choice) 
    VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [question_text, choice1, choice2, choice3, choice4, correct_choice], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(201).send(createSuccessResult({ message: 'Question added', question_id: result.insertId }));
  });
});

// Update question
router.put('/:id', (req, res) => {
  const { question_text, choice1, choice2, choice3, choice4, correct_choice, is_active } = req.body;

  if (!question_text || !correct_choice) {
    return res.status(400).send(createErrorResult('Question text and correct choice are required.'));
  }

  const isActiveVal = (typeof is_active === 'boolean') ? is_active : true;

  const sql = `UPDATE ${QUESTION_BANK} SET 
    question_text = ?, choice1 = ?, choice2 = ?, choice3 = ?, choice4 = ?, correct_choice = ?, is_active = ?
    WHERE question_id = ?`;
  db.query(sql, [question_text, choice1, choice2, choice3, choice4, correct_choice, isActiveVal, req.params.id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Question not found'));
    return res.status(200).send(createSuccessResult('Question updated successfully'));
  });
});

// Soft delete question (set is_active to false)
router.delete('/:id', (req, res) => {
  const sql = `UPDATE ${QUESTION_BANK} SET is_active = 0 WHERE question_id = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Question not found'));
    return res.status(200).send(createSuccessResult('Question deactivated successfully'));
  });
});

module.exports = router;
