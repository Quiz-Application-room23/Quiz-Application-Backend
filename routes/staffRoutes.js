const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();
const STAFF = process.env.STAFF_TABLE || 'Staff';  // fallback to 'Staff' if env not set

// Get all staff
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${STAFF} WHERE is_deleted = 0`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(200).send(createSuccessResult("No staff found."));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get staff by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM ${STAFF} WHERE staff_id = ? AND is_deleted = 0`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult("Staff not found."));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add new staff
router.post('/add', (req, res) => {
  const { staff_name, staff_department, staff_email } = req.body;
  if (!staff_name || !staff_department || !staff_email) {
    return res.status(400).send(createErrorResult("Name, department, and email are required."));
  }
  const sql = `INSERT INTO ${STAFF} (staff_name, staff_department, staff_email) VALUES (?, ?, ?)`;
  db.query(sql, [staff_name, staff_department, staff_email], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(201).send(createSuccessResult({
      message: "Staff added successfully.",
      staff_id: result.insertId
    }));
  });
});

// Update staff
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { staff_name, staff_department, staff_email } = req.body;
  if (!staff_name || !staff_department || !staff_email) {
    return res.status(400).send(createErrorResult("Name, department, and email are required."));
  }
  const sql = `UPDATE ${STAFF} SET staff_name = ?, staff_department = ?, staff_email = ? WHERE staff_id = ? AND is_deleted = 0`;
  db.query(sql, [staff_name, staff_department, staff_email, id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult("Staff not found."));
    return res.status(200).send(createSuccessResult("Staff updated successfully."));
  });
});

// Soft delete staff
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE ${STAFF} SET is_deleted = 1 WHERE staff_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult("Staff not found."));
    return res.status(200).send(createSuccessResult("Staff soft deleted successfully."));
  });
});

module.exports = router;
