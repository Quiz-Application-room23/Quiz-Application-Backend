const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config(); 
const BATCH = process.env.COURSE_TABLE


router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Course';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get course by ID
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM Course WHERE course_id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Course not found' });
        res.json(results[0]);
    });
});

// Add a new course
router.post('/', (req, res) => {
    const { course_name } = req.body;
    if (!course_name) return res.status(400).json({ message: 'Course name is required' });

    const sql = 'INSERT INTO Course (course_name) VALUES (?)';
    db.query(sql, [course_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Course added', course_id: result.insertId });
    });
});

// Update course
router.put('/:id', (req, res) => {
    const { course_name } = req.body;
    const sql = 'UPDATE Course SET course_name = ? WHERE course_id = ?';
    db.query(sql, [course_name, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Course updated' });
    });
});

// Delete course
router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM Course WHERE course_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Course deleted' });
    });
});

module.exports = router;