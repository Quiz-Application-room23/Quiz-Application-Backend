const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();
const MODULE = process.env.MODULE_TABLE || 'Module'; // fallback table name

// Get all modules
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${MODULE}`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(200).send(createSuccessResult('No modules found.'));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get module by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM ${MODULE} WHERE mod_id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult('Module not found.'));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add a new module
router.post('/add', (req, res) => {
  const { mod_name, course_id } = req.body;
  if (!mod_name || !course_id) {
    return res.status(400).send(createErrorResult('Module name and course ID are required.'));
  }

  const sql = `INSERT INTO ${MODULE} (mod_name, course_id) VALUES (?, ?)`;
  db.query(sql, [mod_name, course_id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(201).send(createSuccessResult({ message: 'Module created successfully.', mod_id: result.insertId }));
  });
});

// Update module by ID
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { mod_name, course_id } = req.body;
  if (!mod_name || !course_id) {
    return res.status(400).send(createErrorResult('Module name and course ID are required.'));
  }

  const sql = `UPDATE ${MODULE} SET mod_name = ?, course_id = ? WHERE mod_id = ?`;
  db.query(sql, [mod_name, course_id, id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Module not found.'));
    return res.status(200).send(createSuccessResult('Module updated successfully.'));
  });
});

// Delete module by ID
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM ${MODULE} WHERE mod_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Module not found.'));
    return res.status(200).send(createSuccessResult('Module deleted successfully.'));
  });
});

module.exports = router;
