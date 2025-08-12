const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config();
const GROUP = process.env.GROUP_TABLE || 'GroupTable';

// Get all groups
router.get('/', (req, res) => {
  const sql = `SELECT * FROM ${GROUP}`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(200).send(createSuccessResult(results));
  });
});

// Get group by ID
router.get('/:group_id', (req, res) => {
  const sql = `SELECT * FROM ${GROUP} WHERE group_id = ?`;
  db.query(sql, [req.params.group_id], (err, results) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (results.length === 0) return res.status(404).send(createErrorResult('Group not found'));
    return res.status(200).send(createSuccessResult(results[0]));
  });
});

// Add new group
router.post('/', (req, res) => {
  const { group_name, course_id } = req.body;
  if (!group_name || !course_id) {
    return res.status(400).send(createErrorResult("Group name and course_id are required."));
  }
  const sql = `INSERT INTO ${GROUP} (group_name, course_id) VALUES (?, ?)`;
  db.query(sql, [group_name, course_id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    return res.status(201).send(createSuccessResult({
      message: "Group created successfully.",
      group_id: result.insertId
    }));
  });
});

// Update group
router.put('/:group_id', (req, res) => {
  const { group_name, course_id } = req.body;
  if (!group_name || !course_id) {
    return res.status(400).send(createErrorResult("Group name and course_id are required."));
  }
  const sql = `UPDATE ${GROUP} SET group_name = ?, course_id = ? WHERE group_id = ?`;
  db.query(sql, [group_name, course_id, req.params.group_id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Group not found'));
    return res.status(200).send(createSuccessResult("Group updated successfully."));
  });
});

// Delete group
router.delete('/:group_id', (req, res) => {
  const sql = `DELETE FROM ${GROUP} WHERE group_id = ?`;
  db.query(sql, [req.params.group_id], (err, result) => {
    if (err) return res.status(500).send(createErrorResult(err));
    if (result.affectedRows === 0) return res.status(404).send(createErrorResult('Group not found'));
    return res.status(200).send(createSuccessResult("Group deleted successfully."));
  });
});

module.exports = router;
