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
       

        db.query(`SELECT *  FROM INFORMATION_SCHEMA.TABLES  
            where table_schema='webdb2025';`,(error,results)=>{
            if(error){throw error}
            var context={
                who:name,
                login:login,
                body:'tableManage.ejs',
                cls:cls,
                list:results,
                categorys: '',
                boardtypes:'',
                codes:'',
                cu:'',
                p:''
            }
        res.render('mainFrame',context,(err,html)=>{
            if(err)console.log(err)
            res.send(html)
        })
        })
    },
    list:(req,res)=>{
        var{login,name,cls}=authIsOwner(req,res)
        var post=req.body
        var tablename=sanitizeHtml(req.params.tableName)
        

        db.query(`SELECT TABLE_NAME, COLUMN_COMMENT, DATA_TYPE, COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = 'webdb2025' AND TABLE_NAME = ?;`,[tablename],(error,results)=>{
            if(error){throw error}
                
                db.query(`SELECT * FROM ??`, [tablename], (err, result) => {
                        if (err) throw err;
    
            var context={
                who:name,
                login:login,
                body:'tableView.ejs',
                cls:cls,
                list:result,
                categorys: '',
                boardtypes:'',
                codes:results,
                cu:'',
                p:''
            }
            console.log("📄 codes:", results); // 컬럼 정보
            console.log("📊 list:", result);   // 테이블 행
        res.render('mainFrame',context,(err,html)=>{
            if(err)console.log(err)
            res.send(html)
        })
        })
    })
    }
}