const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();

const QUIZQUESTIONMAP = process.env.QUIZQUESTIONMAP_TABLE || 'QuizQuestionMap';
const QUIZDATA = process.env.QUIZDATA_TABLE || 'QuizData';
const QUESTIONBANK = process.env.QUESTIONBANK_TABLE || 'QuestionBank';

// Helper function to check existence of quiz_id
function checkQuizExists(quiz_id) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT quiz_id FROM ${QUIZDATA} WHERE quiz_id = ?`;
    db.query(sql, [quiz_id], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
}

// Helper function to check existence of question_id
function checkQuestionExists(question_id) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT question_id FROM ${QUESTIONBANK} WHERE question_id = ?`;
    db.query(sql, [question_id], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
}

// Get all mappings
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${QUIZQUESTIONMAP}`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get mapping by quiz_id and question_id
router.get('/:quiz_id/:question_id', (req, res) => {
  const sql = `SELECT * FROM ${QUIZQUESTIONMAP} WHERE quiz_id = ? AND question_id = ?`;
  db.query(sql, [req.params.quiz_id, req.params.question_id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult('Mapping not found'));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add new mapping with validation
router.post('/', async (req, res) => {
  const { quiz_id, question_id } = req.body;

  if (!quiz_id || !question_id) {
    return res.status(400).send(createErrorResult('quiz_id and question_id are required'));
  }

  try {
    const quizExists = await checkQuizExists(quiz_id);
    if (!quizExists) {
      return res.status(400).send(createErrorResult('quiz_id does not exist'));
    }

    const questionExists = await checkQuestionExists(question_id);
    if (!questionExists) {
      return res.status(400).send(createErrorResult('question_id does not exist'));
    }

    const sql = `INSERT INTO ${QUIZQUESTIONMAP} (quiz_id, question_id) VALUES (?, ?)`;
    db.query(sql, [quiz_id, question_id], (err, result) => {
      if (err) return res.status(500).send(createErrorResult(err));
      return res.status(201).send(createSuccessResult({ message: 'Mapping added', quiz_id, question_id }));
    });
  } catch (error) {
    return res.status(500).send(createErrorResult(error));
  }
});

// Update existing mapping with validation
router.put('/:quiz_id/:question_id', async (req, res) => {
  const { quiz_id: oldQuizId, question_id: oldQuestionId } = req.params;
  const { quiz_id: newQuizId, question_id: newQuestionId } = req.body;

  if (!newQuizId || !newQuestionId) {
    return res.status(400).send(createErrorResult('New quiz_id and question_id are required'));
  }

  try {
    const quizExists = await checkQuizExists(newQuizId);
    if (!quizExists) {
      return res.status(400).send(createErrorResult('New quiz_id does not exist'));
    }

    const questionExists = await checkQuestionExists(newQuestionId);
    if (!questionExists) {
      return res.status(400).send(createErrorResult('New question_id does not exist'));
    }

    const updateSql = `UPDATE ${QUIZQUESTIONMAP} SET quiz_id = ?, question_id = ? WHERE quiz_id = ? AND question_id = ?`;
    db.query(updateSql, [newQuizId, newQuestionId, oldQuizId, oldQuestionId], (err, result) => {
      if (err) return res.status(500).send(createErrorResult(err));
      if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Mapping not found'));
      return res.status(200).send(createSuccessResult('Mapping updated successfully'));
    });
  } catch (error) {
    return res.status(500).send(createErrorResult(error));
  }
});

// Delete mapping
router.delete('/:quiz_id/:question_id', (req, res) => {
  const sql = `DELETE FROM ${QUIZQUESTIONMAP} WHERE quiz_id = ? AND question_id = ?`;
  db.query(sql, [req.params.quiz_id, req.params.question_id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Mapping not found'));
    return res.status(200).send(createSuccessResult('Mapping deleted successfully'));
  });
});

module.exports = router;
