const { update_process } = require('./board');
var db = require('./db');
var sanitizeHtml = require("sanitize-html");


function authIsOwner(req, res) {
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    var loginid=''

    if (req.session.is_logined) {
        name = req.session.name;
        login = true;
        cls = req.session.cls;
        loginid=req.session.loginid
        
    }
    return { name, login, cls ,loginid};
}

module.exports = {
    purchase:(req,res)=>{
        var { name, login, cls,loginid } = authIsOwner(req, res);
       
        var prodId=sanitizeHtml(req.params.prodId)
        db.query(`SELECT * FROM product`, (error, products) => {
            if (error) throw error;
            
             db.query(`
             SELECT 
                purchase.*, 
                product.image AS image, 
                product.name AS product_name, 
                product.price AS product_price, 
                product.brand, 
                product.supplier 
            FROM purchase
            JOIN product ON purchase.prod_id = product.prod_id
            WHERE purchase.loginid = ?
        ` ,[loginid]
                , (error, product)=>{
                    if (error) throw error;

            console.log(product)
            var context = {
                who: name,//고객1, 고객2 이런 이름 아이디랑 다름
                login: login,//로그인 상태
                body: 'purchase.ejs',//mainFrame에 주는거
                cls: cls,//MNG, CST
                loginid:loginid,
                list:products,
                categorys:'',
                boardtypes:'',
                lists: product,
                board:'',
                cu:'d',
                id:'',
                total:'',
                pNum:'',
                p:'Y'
            };
            
            res.render('mainFrame', context);
        });
    })

    },
    purchasedetail: (req, res) => {
        var post = req.body;
        
        var { name, login, cls,loginid } = authIsOwner(req, res);
        var p="Y"
        var prodId=sanitizeHtml(req.params.prodId)

        console.log('prodId:', prodId);
        db.query(`SELECT * FROM product`, (error, products) => {
            if (error) throw error;
        
            const sql = `SELECT * FROM product WHERE prod_id = ?` 

        db.query(sql, [prodId], (error, result) => {
        if (error) throw error;
        console.log('result:', result);

            var context = {
                who: name,//고객1, 고객2 이런 이름 아이디랑 다름
                login: login,//로그인 상태
                body: 'purchaseDetail.ejs',//mainFrame에 주는거
                cls: cls,//MNG, CST
                loginid:loginid,
                list:result,
                categorys:'',
                boardtypes:'',
                lists: result,
                board:'',
                cu:'d',
                id:'',
                total:'',
                pNum:'',
                p:'Y'
            };
            
            res.render('mainFrame', context);
        });
    })
    },
    purchasedetailPost: (req, res) => {
    var post = req.body;
    var { name, login, cls, loginid } = authIsOwner(req, res);
    var prodId = sanitizeHtml(req.params.prodId);

    // 예: 수량, 결제 버튼 등 POST 데이터 받아 처리
    // 필요한 값들 예: post.qty, post.action 등

    // 예시로 수량 변경 시 처리 코드 (원하는 로직에 맞게 변경)
    var qty = parseInt(post.qty);

    // 구매내역 수정 쿼리 (예시)
    

    db.query(`UPDATE purchase SET qty = ? WHERE loginid = ? AND prod_id = ?`, [qty, loginid, prodId], (error, result) => {
        if (error) throw error;

        // 수정 후 다시 상세 페이지로 리다이렉트
        res.redirect(`/purchase/detail/${prodId}`);
    });
},
    cart: (req, res) => {
        var { name, login, cls,loginid } = authIsOwner(req, res);
        var prodId=sanitizeHtml(req.params.prodId)
        db.query(`SELECT * FROM product`, (error, products) => {
            if (error) throw error;
            db.query(`
   SELECT 
    cart.*, 
    product.image AS image, 
    product.name AS product_name, 
    product.price AS product_price, 
    product.brand, 
    product.supplier,
    p.qty AS purchase_qty
FROM cart
JOIN product 
    ON product.prod_id = cart.prod_id
LEFT JOIN (
    SELECT
        loginid,
        prod_id,
        qty,
        ROW_NUMBER() OVER (PARTITION BY loginid, prod_id ORDER BY date DESC) AS rn
    FROM purchase
    WHERE cancel = 'N'
) AS p ON p.loginid = cart.loginid AND p.prod_id = cart.prod_id AND p.rn = 1
WHERE cart.loginid = ?

        `
                ,[loginid], (error, product) => {
                    if (error) throw error;
                    console.log(product)
                    
            var context = {
                who: name,//고객1, 고객2 이런 이름 아이디랑 다름
                login: login,//로그인 상태
                body: 'cart.ejs',//mainFrame에 주는거
                cls: cls,//MNG, CST
                loginid:loginid,
                list:products,
                categorys:'',
                boardtypes:'',
                lists: product,
                board:'',
                cu:'d',
                id:'',
                total:'',
                pNum:'',
                p:"Y"
            };
            res.render('mainFrame', context);
        });
    })
},
cart_process: (req, res) => {
    var { name, login, cls, loginid } = authIsOwner(req, res);
    
    var post = req.body;
    var sntzedprodId = sanitizeHtml(post.prod_id);    // 상품 ID
    var sntzedPrice = sanitizeHtml(post.price);       // 가격
    var sntzedqty = sanitizeHtml(post.qty);           // 수량

    var sntzedpoint = 0;    // 포인트가 없으면 0 처리
    var sntzedtotal = parseInt(sntzedPrice) * parseInt(sntzedqty);  // 총액 계산
    var sntzedpayYN = 'N';  // 기본 결제 여부 'N' 또는 'Y' 처리
    var sntzedcancel = 'N'; // 기본 취소 여부 'N'

   var date = new Date().toLocaleString('ko-KR');
    if (!post.prod_id || !post.price || !post.qty) {
        return res.send(`
            <script>
                alert("결제하려면 상품을 선택해주세요.");
                location.href="/purchase/cart";
            </script>
        `);
    }


    db.query(
        `INSERT INTO purchase 
        (loginid, prod_id, date, price, point, qty, total, payYN, cancel)
        VALUES ( ?, ?, ?, ?, ?, ?, ?, ?,?)`,
        [loginid,sntzedprodId, date, sntzedPrice, sntzedpoint, sntzedqty, sntzedtotal, sntzedpayYN, sntzedcancel],
        (error, result) => {
            if (error) throw error;
            res.redirect('/purchase');
        }
    );
},

update_process:(req,res)=>{
    var { name, login, cls, loginid } = authIsOwner(req, res);
    var purId = sanitizeHtml(req.params.purId);
    
    // 구매 취소 처리: cancel을 'Y'로 업데이트
    db.query(
        `UPDATE purchase SET cancel = 'Y' WHERE purchase_id = ?`,
        [purId],
        (err, result) => {
            if (err) throw err;
            res.redirect('/purchase'); // 업데이트 후 목록 페이지로 이동
        }
    );
},
j_process: (req, res) => {
var { name, login, cls, loginid } = authIsOwner(req, res);
var post=req.body
var merId=sanitizeHtml(post.prod_id)
var date = new Date().toLocaleString('ko-KR');
console.log(post)

  db.query(
    `SELECT * FROM cart WHERE loginid = ? AND prod_id = ?`,
    [loginid, merId],
    (err, results) => {
      if (err) {
        throw(err)
      }
      console.log(results)

      if (results.length > 0) {
        // 장바구니에 이미 있음
        return res.send(`
          <script>
            alert("이미 장바구니에 있는 상품입니다.");
            location.href = '/purchase/cart';
          </script>
        `);
      }
 
    db.query(
        `INSERT INTO cart
        (loginid, prod_id, date)
        VALUES ( ?, ?, ?)`,
        [loginid,merId, date ],
        (error, result) => {
            if (error) throw error;
            res.redirect('/purchase/cart');
        }
    );
  })

},


delete_process: (req, res) => {
  var post = req.body.item;
  console.log(post)
  console.log('req.body:', req.body.item); 
  

const cartIds = post
  .filter(item => item.selected === '1')  // 체크된 항목만
  .map(item => item.cart_id);  // cart_id 배열 추출

  if (!cartIds) {
    return res.send(`
      <script>
        alert("삭제할 상품을 선택하세요.");
        location.href = '/purchase/cart';
      </script>
    `);
  }

  // purchaseIds가 하나면 배열로 만들어주기
  // if (!Array.isArray(cartIds)) {
  //   cartIds = [cartIds];
  // }
 

  db.query(
    `DELETE FROM cart WHERE cart_id IN (?)`,
    [cartIds],
    (err, result) => {
      if (err) {
        console.error(err);
        
      }
      res.redirect('/purchase/cart');
    }
  );
},


a_process: (req, res) => {
  var items = req.body.item;  //

  var purchaseItems = [];
  var cartIds = [];
  var { loginid } = authIsOwner(req, res);
  var now = new Date().toLocaleString('ko-KR');
  var point = 0, payYN = 'N', cancel = 'N';

  for (const key in items) {
    const item = items[key];
    if (!item.selected) continue;

    var prodId = sanitizeHtml(item.prod_id);
    var price = parseInt(sanitizeHtml(item.price));
    var qty = parseInt(sanitizeHtml(item.qty));
    var cartId = sanitizeHtml(item.cart_id);
    var total = price * qty;

    purchaseItems.push([loginid, prodId, now, price, point, qty, total, payYN, cancel]);
    cartIds.push(cartId);
  }

  if (purchaseItems.length === 0) {
    return res.send(`<script>alert("구매할 상품읈 선택해 주세요."); location.href="/purchase/cart";</script>`);
  }

  db.query(
    `INSERT INTO purchase (loginid, prod_id, date, price, point, qty, total, payYN, cancel) VALUES ?`,
    [purchaseItems],
    (err) => {
      if (err) {
        throw(err)
      }

      db.query(
        `DELETE FROM cart WHERE loginid = ? AND cart_id IN (?)`,
        [loginid, cartIds],
        (err2) => {
          if (err2) {
           throw(err2)
          }
          res.redirect('/purchase');
        }
      );
    }
  );
},
 view: (req, res) => {
        var { name, login, cls,loginid } = authIsOwner(req, res);
        var prodId=sanitizeHtml(req.params.prodId)
        var cartid = sanitizeHtml(req.params.cart_id);
        console.log(cartid)
  
        
        var sql1=`select * from person ;`;
        var sql2= `SELECT * FROM product;`;
        var sql3= `SELECT * FROM cart where cart_id=?;`;

       db.query(sql1 + sql2 + sql3, [cartid], (error, results) => {
                    if (error) throw error;
                    console.log(results)
                  
            var context = {
                who: name,//고객1, 고객2 이런 이름 아이디랑 다름
                login: login,//로그인 상태
                body: 'cartU.ejs',//mainFrame에 주는거
                cls: cls,//MNG, CST
                loginid:loginid,
                list:results[0], //pperson
                categorys:'',
                boardtypes:'',
                lists:results[1],//product
                board:results[2],//cart
                cu:'d',
                id:'',
                total:'',
                pNum:'',
                p:"Y"
            };
            res.render('mainFrame', context);
        });
  
},
viewview:(req,res)=>{
  var { name, login, cls,loginid } = authIsOwner(req, res);
        var prodId=sanitizeHtml(req.params.prodId)
        var mer_id = sanitizeHtml(req.params.prod_id);
        console.log(prodId)
        console.log(mer_id)

       db.query(`SELECT 
    purchase.*, 
    product.name AS product_name,
    person.name AS customer_name
    FROM purchase
    JOIN product ON purchase.prod_id = product.prod_id
    JOIN person ON purchase.loginid = person.loginid;`, (error, results) => {
                    if (error) throw error;
                    console.log(results)
                  
            var context = {
                who: name,//고객1, 고객2 이런 이름 아이디랑 다름
                login: login,//로그인 상태
                body: 'purchaseView.ejs',//mainFrame에 주는거
                cls: cls,//MNG, CST
                loginid:loginid,
                list:results, //pperson
                categorys:'',
                boardtypes:'',
                lists:results,//product
                board:results,//cart
                cu:'d',
                id:'',
                total:'',
                pNum:'',
                p:"Y"
            };
            res.render('mainFrame', context);
        });

},
purupdate:(req,res)=>{
  var { name, login, cls,loginid } = authIsOwner(req, res);
        var prodId=sanitizeHtml(req.params.prodId)
        var mer_id = sanitizeHtml(req.params.prod_id);
        var purId=sanitizeHtml(req.params.purchaseId)
        console.log("params:", req.params);
        console.log("purchaseId:", req.params.purchaseId);

        var sql1=`select * from person ;`;
        var sql2= `SELECT * FROM product;`;
        var sql3= `SELECT * FROM purchase WHERE  purchase_id = ?;`;

       db.query(sql1 + sql2 + sql3, [purId], (error, results) => {
                    if (error) throw error;
                    console.log(results)
                   
            var context = {
                who: name,//고객1, 고객2 이런 이름 아이디랑 다름
                login: login,//로그인 상태
                body: 'purchaseU.ejs',//mainFrame에 주는거
                cls: cls,//MNG, CST
                loginid:loginid,
                list:results[0], //pperson
                categorys:'',
                boardtypes:'',
                lists:results[1],//product
                board:results[2],//
                cu:'d',
                id:'',
                total:'',
                pNum:'',
                p:"Y"
            };
            res.render('mainFrame', context);
        });

},
purupdate_process:(req,res)=>{
        var post=req.body
        console.log(post)
        var purId=sanitizeHtml(post.purchase_id)
        var customer=sanitizeHtml(post.customer)
        var qty=sanitizeHtml(post.qty)
        var product=sanitizeHtml(post.product)
        var point=sanitizeHtml(post.point)
        var total=sanitizeHtml(post.total)
        var payYN=sanitizeHtml(post.payYN)
        var cancel=sanitizeHtml(post.cancel)
        var refund=sanitizeHtml(post.refund)


       db.query(
        `UPDATE purchase SET loginid = ?,qty=?, prod_id = ?, point=?, total=?, payYN=?, cancel=?, refund=?
         WHERE purchase_id = ? `, 
            [customer,qty, product, point, total, payYN, cancel, refund, purId], (err, result) => {
            if (err) {throw err}
            console.log(result)

      res.redirect('/purchase/view');
            })
},
purdelete_process:(req,res)=>{
  var purId=sanitizeHtml(req.params.purchaseId)
     console.log(purId)
     
     
     db.query(
        `DELETE from purchase WHERE purchase_id = ?`,
            [purId], (err, result) => {
            if (err) {throw err}
            console.log(result)

      res.redirect('/purchase/view');
    }
  );

}
}
