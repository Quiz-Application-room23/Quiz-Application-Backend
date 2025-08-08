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


module.exports = router;