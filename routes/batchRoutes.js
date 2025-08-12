const express = require('express');
const router = express.Router();
const db = require('./../db/db');
const { createErrorResult, createSuccessResult } = require('../utils/apiResponse');
require('dotenv').config(); 
const BATCH = process.env.BATCH_TABLE

// get all batches
router.get('/',(req,res)=>{
  const sql = `SELECT * FROM ${BATCH}`; 

  db.query(sql, (err ,rows)=>{
   if(err) 
      return res.status(500).send(createErrorResult(err));

   if (rows.length === 0)
      return res.status(200).send(createSuccessResult("No Batch Found."))

   return res.status(200).send(createSuccessResult(rows));
  });
});



// get active batch
router.get('/active', (req, res) => {
    const sql = `SELECT * FROM ${BATCH} WHERE status = 'active' AND is_deleted = 0`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(createErrorResult(err));
        return res.status(200).send(createSuccessResult(results));
    });
});

// get inactive batches
router.get('/inactive', (req, res) => {
    const sql = `SELECT * FROM ${BATCH} WHERE status = 'inactive' AND is_deleted = 0`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(createErrorResult(err));
        return res.status(200).send(createSuccessResult(results));
    });
});

// activate a batch by year (only one active at a time)
router.patch('/activate/:batch_year', (req, res) => {
    const { batch_year } = req.params;
    const deactivateAll = `UPDATE ${BATCH} SET status = 'inactive'`;
    const activateOne = `UPDATE ${BATCH} SET status = 'active' WHERE batch_year = ? AND is_deleted = 0`;

    db.query(deactivateAll, (err) => {
        if (err) return res.status(500).send(createErrorResult(err));
        db.query(activateOne, [batch_year], (err, result) => {
            if (err) return res.status(500).send(createErrorResult(err));
            if (result.affectedRows === 0) return res.status(404).send(createErrorResult("Batch not found for given year"));
            return res.status(200).send(createSuccessResult(`Batch ${batch_year} is now active.`));
        });
    });
});
// Get single batch by ID

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM ${BATCH} WHERE batch_id = ?`;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).send(createErrorResult(err));

    if (rows.length === 0) {
      return res.status(404).send( createErrorResult( "Batch not found") );
    }
    return res.status(200).send(createSuccessResult(rows[0]));

  });
});

// Get id by year
router.get('/id-by-year/:batch_year', (req, res) => {
  const year = req.params.batch_year;

  const sql = `SELECT batch_id FROM ${BATCH} WHERE batch_year = ?`;
  db.query(sql, [year], (err, rows) => {
    if (err) {
      return res.status(500).send(createErrorResult(err));
    }

    if (rows.length === 0) {
      return res.status(404).send(createErrorResult("No batch found for this year"));
    }

    // Return only the batch_id value
    return res.status(200).send(createSuccessResult(rows[0]));
  });
});


// add a batch
router.post('/add', (req, res) => {
  const { batch_year } = req.body;
  if (!batch_year)
    return res.status(400).send(createErrorResult("Batch year is required."));
  const sql=`INSERT INTO ${BATCH} (batch_year) VALUE (?)`;
  db.query(sql,[batch_year], (err, result) => {
    if (err) 
      return res.status(500).send(createSuccessResult(err));
return res.status(201).send(createSuccessResult({
      message: "Batch created successfully.",
      batch_id: result.insertId
    }));

  });
});

// UPDATE batch
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { batch_year } = req.body;

  if (!batch_year)
    return res.status(400).send(createErrorResult("Batch year is required."));

  const sql = `UPDATE ${BATCH} SET batch_year = ? WHERE batch_id = ?`;
  db.query(sql, [batch_year, id], (err, result) => {
    if (err)
      return res.status(500).send(createErrorResult(err));

    if (result.affectedRows === 0)
      return res.status(404).send(createErrorResult("Batch not found."));

    return res.status(200).send(createSuccessResult("Batch updated successfully."));
  });
});


// DELETE batch by ID

// router.delete ('/:batch_id',(req,res)=>{
//   const {batch_id}=req.params;
//   const sql = `DELETE FROM ${BATCH} WHERE batch_id = ?`;
//   db.query(sql, [batch_id], (err, result)=>{
//     if(err)
//       return res.status(500).send(createErrorResult(err));

//      if (result.affectedRows === 0)
//       return res.status(404).send(createErrorResult("Batch deleted."));

//   });
// });

// soft delete batch
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = `UPDATE ${BATCH} SET is_deleted = 1 WHERE batch_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(createErrorResult(err));
        if (result.affectedRows === 0) return res.status(404).send(createErrorResult("Batch not found"));
        return res.status(200).send(createSuccessResult("Batch soft deleted successfully."));
    });
});



module.exports = router;

