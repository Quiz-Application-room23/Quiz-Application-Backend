const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();
const STUDENT = process.env.STUDENT_TABLE || 'Student';

// Get all students
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${STUDENT}`; // no is_deleted column in your schema
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get student by ID
router.get('/:id', (req, res) => {
  const sql = `SELECT * FROM ${STUDENT} WHERE stud_id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult('Student not found'));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add new student
router.post('/', (req, res) => {
  const { stud_name, stud_DOB, student_email, stud_batchid, group_id } = req.body;
  if (!stud_name || !stud_DOB || !student_email || !stud_batchid) {
    return res.status(400).send(createErrorResult('Name, DOB, email, and batch_id are required'));
  }
  const sql = `INSERT INTO ${STUDENT} (stud_name, stud_DOB, student_email, stud_batchid, group_id) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [stud_name, stud_DOB, student_email, stud_batchid, group_id || null], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(201).send(createSuccessResult({ message: 'Student added', stud_id: result.insertId }));
  });
});

// Update student
router.put('/:id', (req, res) => {
  const { stud_name, stud_DOB, student_email, stud_batchid, group_id } = req.body;
  if (!stud_name || !stud_DOB || !student_email || !stud_batchid) {
    return res.status(400).send(createErrorResult('Name, DOB, email, and batch_id are required'));
  }
  const sql = `UPDATE ${STUDENT} SET stud_name = ?, stud_DOB = ?, student_email = ?, stud_batchid = ?, group_id = ? WHERE stud_id = ?`;
  db.query(sql, [stud_name, stud_DOB, student_email, stud_batchid, group_id || null, req.params.id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Student not found'));
    return res.status(200).send(createSuccessResult('Student updated successfully'));
  });
});

// Delete student (hard delete)
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM ${STUDENT} WHERE stud_id = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Student not found'));
    return res.status(200).send(createSuccessResult('Student deleted successfully'));
  });
});

module.exports = router;
