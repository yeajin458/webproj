const express=require('express')
const router=express.Router()
var root=require('../lib/root')
const multer=require('multer')
const upload=multer({
    storage: multer.diskStorage({
        destination: function(req,file,cb){cb(null,'public/images') },
        filename:function(req,file,cb){
            var newFileName=Buffer.from(file.originalname,"latin1").toString("utf-8")
                cb(null,newFileName);
        }
    })

})

//var topic=require('../lib/topic')//작업 폴더로 이동
router.get('/',(req,res)=>{
    root.home(req,res)
})
router.get('/category/:categ',(req,res)=>{
    root.categoryview(req,res)
})
router.post('/search',(req,res)=>{
    root.search(req,res)
})
router.get('/detail/:prodId',upload.single('uploadFile'),(req,res)=>{
    root.detail(req,res)
})
router.get('/cartview',(req,res)=>{
    root.cartview(req,res)
})
router.get('/cartupdate/:cartId',(req,res)=>{
    root.cartupdate(req,res)
})
router.post('/cartupdate_process',(req,res)=>{
    root.cartupdate_process(req,res)
})
router.get('/cartdelete/:cartId',(req,res)=>{
    root.cartdelete_process(req,res)
})
router.get('/anal/customer',(req,res)=>{
    root.customer(req,res)
})

 module.exports = router;