const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();

const QUIZRESULT = process.env.QUIZRESULT_TABLE || 'QuizResult';

// Get all quiz results
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${QUIZRESULT}`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get quiz result by ID
router.get('/:result_id', (req, res) => {
  const sql = `SELECT * FROM ${QUIZRESULT} WHERE result_id = ?`;
  db.query(sql, [req.params.result_id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult('QuizResult not found'));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add new quiz result
router.post('/', (req, res) => {
  const { quiz_id, stud_id, score, result_list, attempt_no } = req.body;
  if (!quiz_id || !stud_id || score === undefined) {
    return res.status(400).send(createErrorResult('quiz_id, stud_id, and score are required'));
  }
  // result_list is optional here
  const attemptNoVal = attempt_no || 1;

  // Validate foreign keys exist
  const checkQuizSql = 'SELECT quiz_id FROM QuizData WHERE quiz_id = ?';
  const checkStudentSql = 'SELECT stud_id FROM Student WHERE stud_id = ?';

  db.query(checkQuizSql, [quiz_id], (err, quizResults) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (quizResults.length === 0) return res.status(400).send(createErrorResult('Invalid quiz_id'));

    db.query(checkStudentSql, [stud_id], (err, studentResults) => {
      if (err) return res.status(500).send(createErrorResult(err));
      if (studentResults.length === 0) return res.status(400).send(createErrorResult('Invalid stud_id'));

      const insertSql = `INSERT INTO ${QUIZRESULT} (quiz_id, stud_id, score, result_list, attempt_no) VALUES (?, ?, ?, ?, ?)`;
      db.query(insertSql, [quiz_id, stud_id, score, result_list || null, attemptNoVal], (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send(createErrorResult('Duplicate entry'));
          }
          return res.status(500).send(createErrorResult(err));
        }
        return res.status(201).send(createSuccessResult({
          message: 'Quiz result added successfully',
          result_id: result.insertId
        }));
      });
    });
  });
});

// Update quiz result - partial update allowed, no required fields except at least one present
router.put('/:result_id', (req, res) => {
  const { quiz_id, stud_id, score, result_list, attempt_no } = req.body;

  // Check at least one field is present to update
  if (
    quiz_id === undefined &&
    stud_id === undefined &&
    score === undefined &&
    result_list === undefined &&
    attempt_no === undefined
  ) {
    return res.status(400).send(createErrorResult('At least one field required for update'));
  }

  // Validate foreign keys if provided
  const checkQuiz = (callback) => {
    if (quiz_id === undefined) return callback(null);
    db.query('SELECT quiz_id FROM QuizData WHERE quiz_id = ?', [quiz_id], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Invalid quiz_id'));
      callback(null);
    });
  };

  const checkStudent = (callback) => {
    if (stud_id === undefined) return callback(null);
    db.query('SELECT stud_id FROM Student WHERE stud_id = ?', [stud_id], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Invalid stud_id'));
      callback(null);
    });
  };

  checkQuiz((err) => {
    if (err) return res.status(400).send(createErrorResult(err.message || err));

    checkStudent((err) => {
      if (err) return res.status(400).send(createErrorResult(err.message || err));

      // Build update query dynamically
      const fields = [];
      const values = [];
      if (quiz_id !== undefined) {
        fields.push('quiz_id = ?');
        values.push(quiz_id);
      }
      if (stud_id !== undefined) {
        fields.push('stud_id = ?');
        values.push(stud_id);
      }
      if (score !== undefined) {
        fields.push('score = ?');
        values.push(score);
      }
      if (result_list !== undefined) {
        fields.push('result_list = ?');
        values.push(result_list);
      }
      if (attempt_no !== undefined) {
        fields.push('attempt_no = ?');
        values.push(attempt_no);
      }
      values.push(req.params.result_id);

      const sql = `UPDATE ${QUIZRESULT} SET ${fields.join(', ')} WHERE result_id = ?`;
      db.query(sql, values, (err, result) => {
        if (err) return res.status(500).send(createErrorResult(err));
        if (result.affectedRows === 0) return res.status(404).send(createErrorResult('QuizResult not found'));
        return res.status(200).send(createSuccessResult('Quiz result updated successfully'));
      });
    });
  });
});

// Delete quiz result
router.delete('/:result_id', (req, res) => {
  const sql = `DELETE FROM ${QUIZRESULT} WHERE result_id = ?`;
  db.query(sql, [req.params.result_id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('QuizResult not found'));
    return res.status(200).send(createSuccessResult('Quiz result deleted successfully'));
  });
});



module.exports = router;
