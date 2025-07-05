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
        db.query(`SELECT * FROM code`, (error, codes) => {
            if (error) throw error;

            var context = {
                who: name,
                login: login,
                body: 'code.ejs',
                cls: cls,
                categorys:'',
                boardtypes:'',
                codes:'',
                list: codes,
                code:''
            };
            res.render('mainFrame', context);
        });
    },

    create: (req, res) => {
        var { name, login, cls } = authIsOwner(req, res);
        db.query(`SELECT * FROM code`, (error, codes) => {
            if (error) throw error;
            var context = {
                who: name,
                login: login,
                body: 'codeC.ejs',
                cls: cls,
                categorys: '',
                boardtypes:'',
                codes:'',
                list: codes,
                code:''
            };
            res.render('mainFrame', context);
        });
    },

    create_process: (req, res) => {
        var post = req.body;
        var sntzedmain_id=sanitizeHtml(post.main_id)
        var sntzedsub_id=sanitizeHtml(post.sub_id)
        var sntzedmain_name=sanitizeHtml(post.main_name)
        var sntzedsub_name=sanitizeHtml(post.sub_name)
        var sntzedstart=sanitizeHtml(post.start)
        var sntzedend=sanitizeHtml(post.end)

        db.query(`INSERT INTO code(main_id, sub_id, main_name, sub_name, start, end)
                  VALUES(?,?,?,?,?,?)`,
            [sntzedmain_id, sntzedsub_id, sntzedmain_name, sntzedsub_name, sntzedstart, sntzedend],
            (error, result) => {
                if (error) throw error;
                res.redirect(`/code/view`);
            });
    },

    update: (req, res) => {
        var { name, login, cls } = authIsOwner(req, res);
        var main = sanitizeHtml(req.params.main);
        var sub = sanitizeHtml(req.params.sub);
        var start = sanitizeHtml(req.params.start);
        
        db.query(`SELECT * FROM code`, (error, codes) => {
            if (error) throw error;
            db.query(`SELECT * FROM code WHERE main_id=? AND sub_id=? AND start=? `,
                [main, sub, start],
                (error2, code) => {
                    if (error2) throw error2;
                    var context = {
                        who: name,
                        login: login,
                        body: 'codeU.ejs',
                        cls: cls,
                        categorys: '',
                        boardtypes:'',
                        codes:'',
                        list: codes,
                        code: code[0]  // 편집 대상 데이터 전달
                    };
                    res.render('mainFrame', context);
                });
        });
    },

    update_process: (req, res) => {
        var post = req.body;
        var sntzedmain_id=sanitizeHtml(post.main_id)
        var sntzedsub_id=sanitizeHtml(post.sub_id)
        var sntzedmain_name=sanitizeHtml(post.main_name)
        var sntzedsub_name=sanitizeHtml(post.sub_name)
        var sntzedstart=sanitizeHtml(post.startdate)
        var sntzedend=sanitizeHtml(post.end)
        var sntzedp_start=sanitizeHtml(post.p_start)
        var sntzedp_end=sanitizeHtml(post.p_end)

        db.query(
           `UPDATE code SET main_name = ?, sub_name = ?, start = ?, end = ?
            WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?`,
            [sntzedmain_name, sntzedsub_name, sntzedstart, sntzedend,
                sntzedmain_id, sntzedsub_id, sntzedp_start,sntzedp_end],
            (error, result) => {
                if (error) throw error;
                res.redirect('/code/view');
            });
    },

    delete_process: (req, res) => {
        var main = req.params.main;
        var sub = sanitizeHtml(req.params.sub);
        var start = sanitizeHtml(req.params.start);
        var end = sanitizeHtml(req.params.end);

        db.query(
            `DELETE FROM code WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?`,
            [main, sub, start, end], (error, result) => {
                if (error) throw error;
                res.redirect('/code/view');
            });
    }
};
