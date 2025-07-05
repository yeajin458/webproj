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
    typeview: (req, res) => {
        var { name, login, cls,loginid } = authIsOwner(req, res);
        db.query(`SELECT * FROM boardtype`, (error, boards) => {
            if (error) throw error;

            var context = {
                who: name,//고객1, 고객2 이런 이름 아이디랑 다름
                login: login,//로그인 상태
                body: 'boardtype.ejs',//mainFrame에 주는거
                cls: cls,//MNG, CST
                loginid:loginid,
                list:'',
                categorys:'',
                boardtypes:boards,
                lists: boards,
                board:'',
                cu:'',
                id:'',
                total:'',
                pNum:''
            };
            res.render('mainFrame', context);
        });
    },

    typecreate: (req, res) => {
        var { name, login, cls,loginid } = authIsOwner(req, res);
       
        db.query(`SELECT * FROM boardtype`, (error, boards) => {
            if (error) throw error;
            var context = {
                who: name,
                login: login,
                body: 'boardtypeCU.ejs',
                cls: cls,
                loginid:loginid,
                list:'',
                categorys: '',
                boardtypes:boards,
                lists: boards,
                board:'',//update
                cu:'c',
                id:'',
                total:'',
                pNum:''
            };
            res.render('mainFrame', context);
        });
    },

    typecreate_process: (req, res) => {
        var post = req.body;
        var sntzedType_id=sanitizeHtml(post.type_id)
        var sntzedTitle=sanitizeHtml(post.title)
        var sntzedDescription=sanitizeHtml(post.description)
        var sntzedWriteYN=sanitizeHtml(post.write_YN)
        var sntzedReYN=sanitizeHtml(post.re_YN)
        var sntzedNumperpage=sanitizeHtml(post.numPerPage)

        db.query(`INSERT INTO boardtype(title, description, write_YN, re_YN, numPerPage )
                  VALUES(?,?,?,?,?)`,
            [sntzedTitle,sntzedDescription,sntzedWriteYN,sntzedReYN,sntzedNumperpage],
            (error, result) => {
                if (error) throw error;
                res.redirect(`/board/type/view`);
            });
    },

    typeupdate: (req, res) => {
        var { name, login, cls,loginid } = authIsOwner(req, res);
        var typeId = sanitizeHtml(req.params.typeId);
        
        db.query(`SELECT * FROM boardtype`, (error, boards) => {
            if (error) throw error;
            db.query(`SELECT * FROM boardtype WHERE type_Id=? `,
                [typeId],
                (error2, board) => {
                    if (error2) throw error2;
                    var context = {
                        who: name,
                        login: login,
                        body: 'boardtypeCU.ejs',
                        loginid:loginid,
                        cls: cls, 
                        list:'',
                        categorys: '',
                        boardtypes:boards,
                        code:'',
                        lists: boards,
                        board: board[0],
                        cu:'u',
                        id:'',
                        total:'',
                        pNum:''
                    };
                    res.render('mainFrame', context);
                });
        });
    },

    typeupdate_process: (req, res) => {
        var post = req.body;
        console.log(post)
        var sntzedType_id=sanitizeHtml(post.type_id)
        var sntzedTitle=sanitizeHtml(post.title)
        var sntzedDescription=sanitizeHtml(post.description)
        var sntzedWriteYN=sanitizeHtml(post.write_YN)
        var sntzedReYN=sanitizeHtml(post.re_YN)
        var sntzedNumperpage=sanitizeHtml(post.numPerPage)

        db.query(
           `UPDATE boardtype SET title = ?, description = ?, write_YN = ?, re_YN=?, numPerPage=?
            WHERE type_id = ?`,
            [sntzedTitle, sntzedDescription,sntzedWriteYN,sntzedReYN,sntzedNumperpage,sntzedType_id],
            (error, result) => {
                if (error) throw error;
                res.redirect('/board/type/view');
            });
    },

    typedelete_process: (req, res) => {
        console.log(req.params.typeId)
        var typeId = sanitizeHtml(req.params.typeId);
        db.query(
            `DELETE FROM boardtype WHERE type_id = ? `,
            [typeId], (error, result) => {
                if (error) throw error;
                res.redirect('/board/type/view');
            });
    },
    view: (req, res) => {
    var {name, login, cls,loginid} = authIsOwner(req,res);
    var sntzedTypeId = sanitizeHtml(req.params.typeId);
    var pNum = req.params.pNum;
    var sntzedP_id=0
    var sql1 = `select * from boardtype;` // results[0]
    var sql2 = ` select * from boardtype where type_id = ${sntzedTypeId};` // results[1]
    var sql3 = ` select count(*) as total from board where type_id = ${sntzedTypeId};` // results[2]
    db.query(sql1 + sql2 + sql3, (error,results)=>{
/******페이지 기능 구현 *********/
            var numPerPage = results[1][0].numPerPage;
            var offs = (pNum-1)*numPerPage;
            var totalPages = Math.ceil(results[2][0].total / numPerPage);
            var now = new Date().toLocaleString();
            db.query(`select b.board_id as board_id, b.title as title, b.date as date, p.name as name
                    from board b inner join person p on b.loginid = p.loginid 
                    where b.type_id = ?      ORDER BY 
        CASE 
            WHEN b.p_id = 0 THEN b.board_id 
            ELSE b.p_id 
        END, 
        CASE 
            WHEN b.p_id = 0 THEN 0 
            ELSE b.board_id 
        END  LIMIT ? OFFSET ?`,
                    [sntzedTypeId, numPerPage, offs], (err,boards)=>{
            console.log('boards:', boards);
            var context = {
                who: name,
                login: login,
                body: 'board.ejs',
                loginid:loginid,
                cls: cls,
                list:results[1],//boardtype에서 행선택
                categorys: results[2],//type_id의 갯수
                boardtypes:results[0],//boardtype 전체
                codes:results[1],
                lists: boards,
                board:{ 
                    p_id: sntzedP_id,
                    pNum:pNum,
                    type_id: sntzedTypeId,
                    loginid: loginid,
                    date: now,
                    password: '',
                    title: '',
                    content: ''},
                cu:'u',
                id:sntzedTypeId,
                total:totalPages,
                pNum:pNum
            };
            res.render('mainFrame', context);
        });
        })
    },

    create: (req, res) => {
    var { name, login, cls,loginid } = authIsOwner(req, res);
    var sntzedTypeId = sanitizeHtml(req.params.typeId);
    var pNum=sanitizeHtml(req.params.pNum)
    
    var sntzedP_id=0
    var now = new Date().toLocaleString();
    console.log('create: type_id:', req.params.typeId);
    db.query(`SELECT * FROM boardtype WHERE type_id = ?`, [sntzedTypeId], (error2, board) => {
            if (error2) throw error2;
            console.log('boards[0].write_YN:', board[0].write_YN);

       db.query(`SELECT * FROM board`, (error, boards) => {
            if (error) throw error;
            var context = {
                who: name,
                login: login,
                body: 'boardCRU.ejs',
                loginid:loginid,
                cls: cls,
                list: board,
                categorys: '',
                boardtypes:boards,
                codes:'',
                lists: boards,
                board:boards,
                cu:'c',
                id:sntzedTypeId,
                total:'',
                pNum:pNum
            };
           
            res.render('mainFrame', context);
        });
    })

    },

    create_process: (req, res) => {
        var { name, login, cls,loginid } = authIsOwner(req, res);
        var post = req.body;
        var sntzedTypeId = sanitizeHtml(post.typeId);
        var pNum = sanitizeHtml(post.pNum);
        var sntzedP_id=0
        var sntzedBoard_id=sanitizeHtml(post.board_id)
        var sntzedLoginid=sanitizeHtml(post.loginid)
        var sntzedPasswd=sanitizeHtml(post.password)
        var sntzedTitle=sanitizeHtml(post.title)
       
        var sntzedContent=sanitizeHtml(post.content)
        var now = new Date().toLocaleString();
        var sntzedDate = sanitizeHtml(now);

      

        db.query(`INSERT INTO board(type_id, p_id,loginid, password, title, date, content)
                  VALUES(?,?,?,?,?,?,?)`,
            [sntzedTypeId, 0, loginid, sntzedPasswd, sntzedTitle, sntzedDate, sntzedContent],
            (error, result) => {
                if (error) throw error;
                
                res.redirect(`/board/view/${sntzedTypeId}/1`);
            });
    },
    detail: (req, res) => {
    var { name, login, cls, loginid } = authIsOwner(req, res);

    var sntzedBoardId = sanitizeHtml(req.params.boardId);
    var sntzedpNum = sanitizeHtml(req.params.pNum);
    db.query(`
        SELECT b.*, bt.type_id, bt.numPerPage, p.name as name, bt.re_YN
        FROM board b 
        JOIN boardtype bt ON b.type_id = bt.type_id
        JOIN person p ON b.loginid = p.loginid
        WHERE b.board_id = ? `, [sntzedBoardId], (err, boards) => {

        var now = new Date();

        var context = {
            who: name,
            login: login,
            body: 'boardCRU.ejs',
            loginid: loginid,
            cls: cls,
            list: '', 
            categorys: '', 
            boardtypes: '', 
            codes: '',
            lists: '', 
            board: boards,
            cu: 'detail',
            id: sntzedpNum,
            total:'',
            pNum:''
        }

        res.render('mainFrame', context);
    });
},

    update: (req, res) => {
        var { name, login, cls,loginid } = authIsOwner(req, res);
        var boardId = sanitizeHtml(req.params.boardId);
        var typeId = sanitizeHtml(req.params.typeId);
        var pNum = sanitizeHtml(req.params.pNum);
        console.log(typeId)
        console.log(pNum)
       db.query(`
        SELECT b.*, bt.type_id, bt.numPerPage, p.name as name
        FROM board b 
        JOIN boardtype bt ON b.type_id = bt.type_id
        JOIN person p ON b.loginid = p.loginid
        WHERE b.board_id = ? and b.p_id=0 `,
                [boardId],(error2, boards) => {
                    if (error2) throw error2;
                    var context = {
                        who: name,
                        login: login,
                        body: 'boardCRU.ejs',
                        loginid:loginid,
                        cls: cls,
                        list:'',
                        categorys:'',
                        boardtypes:boards,
                        codes:'',
                        lists: boards,
                        board: boards ,
                        cu:'u',
                        id:typeId,
                        total:'',
                        pNum:pNum
                    };
                   
                    
                    res.render('mainFrame', context);
                });
    },

    update_process: (req, res) => {
        var post = req.body;
        var { name, login, cls,loginid } = authIsOwner(req, res);
        console.log('POST BODY:', post); // 여기에 추가
        var sntzedType_id=sanitizeHtml(post.typeId)
        var sntzedBoard_id=sanitizeHtml(post.board_id)
        var sntzedP_id=0
        var pNum = sanitizeHtml(post.pNum);
        var sntzedLoginid=sanitizeHtml(post.loginid)
        var sntzedPasswd=sanitizeHtml(post.password)
        var sntzedTitle=sanitizeHtml(post.title)
        var sntzedDate=sanitizeHtml(post.date)
        var sntzedContent=sanitizeHtml(post.content)
        db.query('SELECT password FROM board WHERE board_id = ?', [sntzedBoard_id], (err, results) => {
                if (err) throw err;
                
                 
                 if (cls !== 'MNG'){
                    var dbPassword = results[0].password;
                    if (sntzedPasswd !== dbPassword) {
                    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
                    return res.end(`<script> alert("비밀번호가 일치하지 않습니다.");
                      location.href='/board/update/${sntzedBoard_id}/${sntzedType_id}/${pNum}';</script>`);
                    }
                }
         db.query( `UPDATE board SET type_id=?,  p_id = ?, loginid = ?, password = ?, title = ?, date = ?, content = ?
                    WHERE board_id = ? `,
            [sntzedType_id,0,sntzedLoginid, sntzedPasswd, sntzedTitle, sntzedDate, sntzedContent,sntzedBoard_id],
            (error, result) => {
                if (error) throw error;
                console.log('Update Result:', result);
                

                res.redirect(`/board/view/${sntzedType_id}/${pNum}`);
            });
        })
    },

    delete_process: (req, res) => {
        var boardId = sanitizeHtml(req.params.boardId);
        var typeId = sanitizeHtml(req.params.typeId);
        var pNum = sanitizeHtml(req.params.pNum);
        db.query(
            `DELETE FROM board WHERE board_id=? `,
            [boardId], (error, result) => {
                if (error) throw error;
                res.redirect(`/board/view/${typeId}/${pNum}`);
            });
    },
    anscreate: (req, res) => {
    var { name, login, cls,loginid } = authIsOwner(req, res);
        var boardId = sanitizeHtml(req.params.boardId);
        var typeId = sanitizeHtml(req.params.typeId);
        var pNum = sanitizeHtml(req.params.pNum);
        console.log(typeId)
        console.log(pNum)
       db.query(`
        SELECT b.*, bt.type_id, bt.numPerPage, p.name as name
        FROM board b 
        JOIN boardtype bt ON b.type_id = bt.type_id
        JOIN person p ON b.loginid = p.loginid
        WHERE b.board_id = ? `,
                [boardId],(error2, boards) => {
                    if (error2) throw error2;
                    var context = {
                        who: name,
                        login: login,
                        body: 'boardCRU.ejs',
                        loginid:loginid,
                        cls: cls,
                        list:'',
                        categorys:'',
                        boardtypes:boards,
                        codes:'',
                        lists: boards,
                        board: boards ,
                        cu:'ans',
                        id:typeId,
                        total:'',
                        pNum:pNum
                    };
           
            res.render('mainFrame', context);
        });

    },

    anscreate_process: (req, res) => {
        
        var post = req.body;
        console.log(post)
        var sntzedTypeId =(post.typeId);
        var pNum = sanitizeHtml(post.pNum);
        var sntzedP_id=(post.p_id)
        var sntzedBoard_id=sanitizeHtml(post.board_id)
        var sntzedLoginid=sanitizeHtml(post.loginid)
        var sntzedPasswd=sanitizeHtml(post.password)
        var sntzedTitle=(post.title)
       
        var sntzedContent=sanitizeHtml(post.answer)
        var now = new Date().toLocaleString();
        var sntzedDate = sanitizeHtml(now);

      

        db.query(`INSERT INTO board(type_id, p_id,loginid, password, title, date, content)
                  VALUES(?,?,?,?,?,?,?)`,
            [sntzedTypeId, sntzedP_id, 'M', sntzedPasswd, '[답변]: '+sntzedTitle, sntzedDate, sntzedContent],
            (error, result) => {
                if (error) throw error;
                
                res.redirect(`/board/view/${sntzedTypeId}/1`);
            });
    }
};

