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
        var { name, login, cls } = authIsOwner(req, res);
        db.query(`SELECT * FROM person`, (error, persons) => {
            if (error) throw error;
            var context = {
                who: name,
                login: login,
                body: 'person.ejs',
                cls: cls,
                categorys: '',
                boardtypes:'',
                codes:'',
                list: persons,
                person:'',
                cu:''
            };
            res.render('mainFrame', context);
        });
    },

    create: (req, res) => {
        var { name, login, cls } = authIsOwner(req, res);
        db.query(`SELECT * FROM person`, (error, persons) => {
            if (error) throw error;
            var context = {
                who: name,
                login: login,
                body: 'personCU.ejs',
                cls: cls,
                categorys: '',
                boardtypes:'',
                codes:'',
                list: persons,
                person:persons,
                cu:'c'
            };
            res.render('mainFrame', context);
        });
    },

    create_process: (req, res) => {
        var post = req.body;
         
        var sntzedLoginid = sanitizeHtml(post.loginid);
        var sntzedPassword = sanitizeHtml(post.password);
        var sntzedName = sanitizeHtml(post.name); 
        var sntzedmf=sanitizeHtml(post.mf)
        var sntzedAddress=sanitizeHtml(post.address)
        var sntzedtel=sanitizeHtml(post.tel)
        var sntzedbirth=sanitizeHtml(post.birth)
        var rclass ='CST'
        db.query(`INSERT INTO person (loginid, password, name, mf, address, tel, birth, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sntzedLoginid, sntzedPassword, sntzedName,sntzedmf, sntzedAddress,sntzedtel,sntzedbirth,rclass],(err,result)=>{
                if(err){throw err}
                res.redirect(`/person/view`);
            });
    },

    update: (req, res) => {
        var { name, login, cls } = authIsOwner(req, res);
        var loginId = req.params.loginId

        db.query(`SELECT * FROM person`, (error, persons) => {
            if (error) throw error;
            db.query(`SELECT * FROM person WHERE loginid=?`,
                [loginId], (error2, person) => {
                    if (error2) throw error2;
                    var context = {
                        who: name,
                        login: login,
                        body: 'personCU.ejs',
                        cls: cls,
                        categorys: '',
                        boardtypes:'',
                        codes:'',
                        list: persons,
                        person: person[0],
                        cu:'u'  // 편집 대상 데이터 전달
                    };
                    res.render('mainFrame', context);
                });
        });
    },

    update_process: (req, res) => {
        var post = req.body;
        var loginId=sanitizeHtml(post.loginid)
        var sntzedPassword=sanitizeHtml(post.password)
        var sntzedName=sanitizeHtml(post.name)
        var sntzedmf=sanitizeHtml(post.mf)
        var sntzedAddress=sanitizeHtml(post.address)
        var sntzedTel=sanitizeHtml(post.tel)
        var sntzedBirth=sanitizeHtml(post.birth)
        var sntzedClass=sanitizeHtml(post.cls)
        db.query(
            `UPDATE person SET password = ?, name = ?, mf = ?, address = ?,tel=?,birth=?,class=?
             WHERE loginid =?`,
            [sntzedPassword,sntzedName,sntzedmf,sntzedAddress,sntzedTel,sntzedBirth,sntzedClass,loginId],
            (error, result) => {
                if (error) throw error;
                res.redirect('/person/view');
            });
    },

    delete_process: (req, res) => {
        var {name,login,cls}=authIsOwner(req,res)
        var loginId=req.params.loginId

        if(!login){
            res.end(`<script type='text/javascript'>alert("Login required~~~")</script>`)
        }

        db.query(
            `DELETE FROM person WHERE loginid = ? `,
            [loginId], (error, result) => {
                if (error) throw error;
                res.redirect('/person/view');
            });
    }
};
