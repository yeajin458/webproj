const express = require("express");
const router = express.Router();
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
var purchase = require('../lib/purchase');

// 구매 목록 페이지 (예: /purchase/)
router.get('/',  upload.single('uploadFile'),(req, res) => {
    purchase.purchase(req, res);
});

// 상세 페이지 
router.get('/detail/:prodId',  upload.single('uploadFile'),(req, res) => {
    purchase.purchasedetail(req, res);
});

// 상세페이지에서 값보내기
router.post('/detail/:prodId', upload.single('uploadFile'), (req, res) => {
    purchase.purchasedetailPost(req, res)
});

// 장바구니 페이지
router.get('/cart', (req, res) => {
    purchase.cart(req, res);
});

//상세정보에서 장바구니를 누르면 cart테이블에 상품이 추가됨
router.post('/j_process', (req, res) => {
    purchase.j_process(req, res);
});

// 바로 구매했을때때
router.post('/cart_process', (req, res) => {
    purchase.cart_process(req, res);
});


// 구매 내역 수정
router.get('/update_process/:purId', (req, res) => {
    purchase.update_process(req, res);
});
router.post('/a_process', (req, res) => {
    purchase.a_process(req, res);
});

// 장바구니에 있는거 삭제
router.post('/delete_process', (req, res) => {
    purchase.delete_process(req, res);
});

//code U.ejs 보이는 화면에서의 수정화면 
router.get('/view/:cart_id', (req, res) => {
    purchase.view(req, res);
});

//관리자 권한의 purchaseRUD나오면 나오는 라우터
router.get('/view', (req, res) => {
    purchase.viewview(req, res);
});
router.get('/purchaseupdate/:purchaseId', (req, res) => {
    purchase.purupdate(req, res);
});

router.post('/purchaseupdate_process', (req, res) => {
    purchase.purupdate_process(req, res);
});
router.get('/purchasedelete/:purchaseId', (req, res) => {
    purchase.purdelete_process(req, res);
});



module.exports = router;
