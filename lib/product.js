var db = require('./db');
var sanitizeHtml = require("sanitize-html");

function authIsOwner(req, res) {
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    if (req.session.is_logined) {
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    return { name, login, cls };
}

module.exports = {
    view: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        db.query(`SELECT * FROM product`, (error, products) => {
            if (error) throw error;
            console.log('products')
            var context = {
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls,
                categorys:'',
                boardtypes:'',
                codes:'',
                list: products,
                code:'',
                list2:''
            };
            res.render('mainFrame', context);
        });
    },

    create: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        db.query(`SELECT * FROM product`, (error, products) => {
            if (error) throw error;
            db.query(`SELECT * FROM code`, (error2, codes) => {
                if (error2) throw error2;
            var context = {
                who: name,
                login: login,
                body: 'productC.ejs',
                cls: cls,
                categorys:'',
                boardtypes:'',
                codes:'',
                list: products,
                code: '',
                list2:codes
            };
            res.render('mainFrame', context);
        });
    })
    },

    create_process: (req, res) => {
        var post = req.body;
        var sntzedmain_id=sanitizeHtml(post.main_id)
        var sntzedsub_id=sanitizeHtml(post.sub_id) 
        var sntzedName=sanitizeHtml(post.name)
        var sntzedPrice=sanitizeHtml(post.price)
        var sntzedStock=sanitizeHtml(post.stock)
        var sntzedSupplier=sanitizeHtml(post.supplier)
        var sntzedBrand=sanitizeHtml(post.brand)
        var imagename=req.file.filename 
       
        db.query(`INSERT INTO product(main_id, sub_id, name, price, stock, supplier, brand,image)
                  VALUES(?,?,?,?,?,?,?,?)`,
            [sntzedmain_id, sntzedsub_id, sntzedName, sntzedPrice, sntzedStock, sntzedSupplier, sntzedBrand,imagename],(error, result) => {
                if (error) throw error;
                res.redirect(`/product/view`);
            });
    },

    update: (req, res) => {
        const { name, login, cls } = authIsOwner(req, res);
        var prodId=sanitizeHtml(req.params.prodId)

        db.query(`SELECT * FROM product`, (error, products) => {
            if (error) throw error;
            db.query(`SELECT * FROM product WHERE prod_id=?`,
                [prodId], (error2, product) => {
                    console.log('product:', product)
                    if (error2) throw error2;
                    db.query(`SELECT * FROM code`, (error3, codes) => {
                         if (error3) throw error3;
                    var context = {
                        who: name,
                        login: login,
                        body: 'productU.ejs',
                        cls: cls,
                        categorys:'',
                        boardtypes:'',
                        codes:'',
                        list: products,  
                        code: product[0], //편집 대상 데이터 
                        list2:codes 
                    };
                    res.render('mainFrame', context);
                });
            })
        });
    },

    update_process: (req, res) => {
        var post = req.body;
        var prodId=post.prodId
        var sntzedmain_id=sanitizeHtml(post.main_id)
        var sntzedsub_id=sanitizeHtml(post.sub_id) 
        var sntzedName=sanitizeHtml(post.name)
        var sntzedPrice=sanitizeHtml(post.price)
        var sntzedStock=sanitizeHtml(post.stock)
        var sntzedSupplier=sanitizeHtml(post.supplier)
        var sntzedBrand=sanitizeHtml(post.brand)
        var imagename = req.file ? req.file.filename : post.nowImage;

    
        db.query(
            `UPDATE product SET main_id=?, sub_id=?, name=?, price=?, stock=?, supplier=?, brand=?, image=?
             WHERE prod_id=?`,
            [sntzedmain_id,sntzedsub_id,sntzedName, sntzedPrice, sntzedStock, sntzedSupplier, sntzedBrand,imagename,prodId],(error, result) => {
                if (error) throw error;
                res.redirect('/product/view');
            });
    },

    delete_process: (req, res) => {
        var prodId=sanitizeHtml(req.params.prodId)

        db.query(`DELETE FROM product WHERE prod_id = ?`, [prodId], (error2, result) => {
            if (error2) throw error2;
                res.redirect('/product/view');
            });
    }
};
