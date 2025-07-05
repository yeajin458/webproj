const { result } = require('lodash')
var db=require('./db')
var sanitizeHtml = require("sanitize-html")
const { detail } = require('./board')

function authIsOwner(req,res) {
    var name='Guest'
    var login=false
    var cls='Non'
    var loginid=''
    if(req.session.is_logined){
        name=req.session.name
        login=true
        loginid=req.session.loginid
        cls=req.session.cls
    }
    return{name,login,cls}
}
module.exports={
    home:(req,res)=>{
        var{login,name,cls}=authIsOwner(req,res)
        var sql1=`select * from boardtype ;`;
        var sql2=`select * from product ;`;
        var sql3=`select * from code ;`;

        db.query(sql1 + sql2 + sql3,(error,results)=>{
            if(error){throw error}
            var context={
                who:name,
                login:login,
                body:'product.ejs',
                cls:cls,
                list:results[1],
                categorys: results[2],
                boardtypes:results[0],
                codes:results[1],
                cu:'',
                p:''
            }
        res.render('mainFrame',context,(err,html)=>{
            if(err)console.log(err)
            res.send(html)
        })
        })
    },
    categoryview:(req,res)=>{
        var categ = req.params.categ; // 예: '00000001'
        var main_id = categ.substring(0, 4); // 앞 4자리
        var sub_id = categ.substring(4);    // 뒤 4자리
        var{login,name,cls}=authIsOwner(req,res)
        var sql1=`select * from boardtype ;`;
        var sql2= `SELECT * FROM product WHERE main_id = ? AND sub_id = ?;`;
        var sql3=`select * from code ;`;

       db.query(sql1 + sql2 + sql3, [main_id, sub_id], (error, results) => {
        if (error) throw error;
        console.log('categ param:', categ);
            var context={
                who:name,
                login:login,
                body:'product.ejs',
                cls:cls,
                list:results[1],
                categorys: results[2],
                boardtypes:results[0],
                codes:results[1],
                cu:'',
                p:''
            }
        res.render('mainFrame',context,(err,html)=>{
            if(err)console.log(err)
            res.send(html)
        })
        })
    },
    search:(req,res)=>{
        var{login,name,cls}=authIsOwner(req,res)
        var search = req.body.search;
        var sql1=`select * from boardtype ;`;
        var sql2=`select * from product ;`;
        var sql3=`select * from product  where name like '%${search}%' or  
        brand like'%${search}%' or  supplier like '%${search}%';`;
        console.log('search:', req.body.search);

        db.query(sql1 + sql2 + sql3,(error,results)=>{
            if(error){throw error}
            var context={
                who:name,
                login:login,
                body:'product.ejs',
                cls:cls,
                list:results[2],
                categorys: results[2],
                boardtypes:results[0],
                codes:'s',
                cu:'',
                p:''
            }
        res.render('mainFrame',context,(err,html)=>{
            if(err)console.log(err)
            res.send(html)
        })
        })
    },
    detail:(req,res)=>{
        var prodId=sanitizeHtml(req.params.prodId)
        var{login,name,cls}=authIsOwner(req,res)
        

        db.query(`select * from product`,(err,product)=>{

            db.query(`select * from product where prod_id=?`,[prodId],(error,products)=>{
                
            if(error){throw error}
            var context={
                who:name,
                login:login,
                body:'productDetail.ejs',
                cls:cls,
                list:product,
                categorys: '',
                boardtypes:'',
                codes:products,
                cu:'rd',
                p:'Y'
            }
            
            if (products.length === 0) {
            return res.send('<h1>해당 상품을 찾을 수 없습니다.</h1>');
    }
        res.render('mainFrame',context,(err,html)=>{
            if(err) throw(err)
            res.send(html)
        })
        })
    })
    },
    cartview:(req,res)=>{
        var prodId=sanitizeHtml(req.params.prodId)
        var{login,name,cls,loginid}=authIsOwner(req,res)
        
    db.query(`SELECT 
    cart.*, 
    product.name AS product_name,
    person.name AS customer_name
FROM cart
JOIN product ON cart.prod_id = product.prod_id
JOIN person ON cart.loginid = person.loginid;
`,(error,cart)=>{
        
        
            if(error){throw error}
            console.log(cart)
            var context={
                who:name,
                login:login,
                body:'cartView.ejs',
                cls:cls,
                list:cart,
                categorys: '',
                boardtypes:'',
                codes:'',
                cu:'rd',
                p:'Y'
            }
           
        res.render('mainFrame',context,(err,html)=>{
            if(err) throw(err)
            res.send(html)
        })
        })
    },
    
    cartupdate_process:(req,res)=>{
        var post=req.body
        console.log(post)
        var cartId=sanitizeHtml(post.cart_id)
        var customer=sanitizeHtml(post.customer)
        var merId=sanitizeHtml(post.product)


       db.query(
        `UPDATE cart SET loginid = ?, prod_id = ? WHERE cart_id = ?`,
            [customer, merId, cartId], (err, result) => {
            if (err) {throw err}
            console.log(result)

      res.redirect('/cartview');
    }
  );
},
cartdelete_process:(req,res)=>{
     
     var cartId=req.params.cartId
     console.log(cartId)
     
     
     db.query(
        `DELETE from cart  WHERE cart_id = ?`,
            [cartId], (err, result) => {
            if (err) {throw err}
            console.log(result)

      res.redirect('/cartview');
    }
  );

},
customer: (req,res)=>{
    var{login,name,cls,loginid}=authIsOwner(req,res)
    db.query(`select address, ROUND((count(*)/(select count(*) from person))*100, 2)as rate
          from person group by address`,(err,results)=>{
             if(err){throw err}
            

            var context={
                who:name,
                login:login,
                body:'ceo.ejs',
                cls:cls,
                list:results,
                categorys: '',
                boardtypes:'',
                codes:'',
                cu:'rd',
                p:'Y'
            }
           
        res.render('mainFrame',context,(err,html)=>{
            if(err) throw(err)
            res.send(html)
        })
        })
}

}