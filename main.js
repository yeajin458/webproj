//202331989 박예진
//1. import 코드들
const express=require('express')
var session=require('express-session')
var MySqlStore=require('express-mysql-session')(session)
//const author = require('./lib/author'); // author.js 파일 경로
var bodyParser=require('body-parser')
const rootRouter=require('./router/rootRouter')
const authRouter=require('./router/authRouter')
const codeRouter=require('./router/codeRouter')
const personRouter=require('./router/personRouter')
const productRouter=require('./router/productRouter')
const boardRouter=require('./router/boardRouter')
const purchaseRouter=require('./router/purchaseRouter')
const tableRouter=require('./router/tableRouter')

//2. 모든 경로에서 실행되어야 하는 모듈들
var options={
    host:'localhost',
    user:'root',
    password:'1234',
    database:'webdb2025',
    multipleStatements:true
}
var sessionStore=new MySqlStore(options)//객체 mysql와 세션이 연동
const app=express()

app.use(session({//세션실행
    secret:'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}))


app.set('views',__dirname+'/views')
app.set('view engine','ejs')

app.use(bodyParser.urlencoded({extended: true}))///바디파서 위에 use 메소드가 있으면 안됨
app.use(express.static('public'))


app.use('/',rootRouter)
app.use('/auth',authRouter)
app.use('/code',codeRouter)
app.use('/person',personRouter)
app.use('/product',productRouter)
app.use('/board',boardRouter)
app.use('/purchase',purchaseRouter)
app.use('/table',tableRouter)


app.get('/favicon.ico',(req,res)=>res.writeHead(404))
app.listen(3067,()=>console.log('Example app listening on port 3000'))
