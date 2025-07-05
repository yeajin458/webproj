const express=require('express')
const router=express.Router()
var table=require('../lib/table')
const multer=require('multer')


//var topic=require('../lib/topic')//작업 폴더로 이동
router.get('/',(req,res)=>{
    table.home(req,res)
})
router.get('/view/:tableName',(req,res)=>{
    table.list(req,res)
})
module.exports = router;