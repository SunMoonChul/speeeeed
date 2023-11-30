const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const { Expo } = require('expo-server-sdk');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dbconfig = require('../config/db.js');
const connection = mysql.createConnection(dbconfig);
connection.connect();

const app = express();

const sessionStore = new MySQLStore(dbconfig);

app.use(bodyParser.json());
app.use(cors());

const port = 3003;

app.use(
    session({
        key: 'userinfo',
        secret: 'nhth453recasd',
        store: sessionStore,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1 * 60 * 1000, //1분
        },
    })
);

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

app.use('/images', express.static("C:/Users/enqn/Pictures"));

app.listen(port, '0.0.0.0', () => {
    console.log(`Express server listening on port ${port}`);
});

app.post('/getSanctions', (req, res) => {
    let sql = 'SELECT my_np, img_path, other_np, date FROM report WHERE other_np = ?';
    let userName = req.body.userName;
    connection.query(sql, [userName], (err, results) => {
        if (err) throw err;
        console.log(results);
        res.json({ results: results });
    });
});

app.post('/myInfo', (req, res) => {
    const {numplate} = req.body;
    const sql = 'SELECT * FROM accelerator WHERE user=?';
    connection.query(sql, [numplate], (err, result) => {
        if(err) {
            res.json({
                success: false,
                message: err
            });
            return;
        }
        console.log(result);
        res.json({success: true, item: result});
    });
})
app.post('/toReport', (req, res) => {
    let sql = 'SELECT my_np, img_path, other_np, date FROM report WHERE my_np = ?';
    let userName = req.body.userName;
    connection.query(sql, [userName], (err, results) => {
        if (err) throw err;
        console.log(results);
        res.json({ results: results });
    });
});
app.post('/signUp', (req, res) => {
    const { id, password, numplate } = req.body;

    const checkId = 'SELECT * FROM userinfo WHERE id = ?';
    connection.query(checkId, [id], (errCheck, resultCheck) => {
        if (errCheck) {
            console.error('데이터 조회 실패', errCheck);
            return;
        }
        else if(resultCheck.length > 0){
            res.json({ 
                success: false,
                message: '해당 아이디는 이미 가입되어있습니다.',
            });
            console.log('해당 아이디는 이미 가입되어있습니다.');
            return;
        }

        const checkNumplate = 'SELECT * FROM userinfo WHERE numplate = ?';
        connection.query(checkNumplate, [numplate], (errCheck, resultCheck) => {
            if (errCheck) {
                console.error('데이터 조회 실패', errCheck);
                return;
            }

            if (resultCheck.length > 0) {
                res.json({
                    success: false,
                    message: '해당 번호의 차량은 이미 가입되어있습니다.',
                });
                console.log('해당 번호의 차량은 이미 가입되어있습니다.');
                return;
            }

            const insertSql = `INSERT INTO userinfo(id, pw, numplate)
            VALUES(?,?,?)`;

            connection.query(insertSql, [id, password, numplate], (errInsert, resultInsert) => {
                if (errInsert) {
                    console.error('데이터 저장 실패', errInsert);
                    res.json({
                        success: false,
                        message: 'Internal Server Error',
                    });
                    return;
                }

                const insertSql2 = 'INSERT INTO accelerator(id, user) VALUES(?, ?)';
                connection.query(insertSql2, [id, numplate], (errInsert2, resultInsert2)=>{
                    if(errInsert2) {
                        console.error('데이터 저장 실패',errInsert2);
                        res.json({
                            success: false,
                            message: 'Internal Server Error'
                        });
                        return;
                    }
                })
                console.log('데이터 저장 성공');

                req.session.uid = id;
                req.session.isLogined = true;

                req.session.save((err) => {
                    if (err) {
                        console.error('세션 저장 실패:', err);
                        return;
                    }
                });
                res.json({ success: true, message: '회원가입 성공' });
            });
        });
    });
});

app.post('/login', (req, res) => {
    const { id, pw } = req.body;
    
    const sql = `SELECT userinfo.* FROM userinfo WHERE userinfo.id = ?`;
    
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('쿼리 실행 실패:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            // 일치하는 아이디가 없는 경우
            res.json({ success: false, message: '일치하는 아이디가 없습니다.' });
        } else {
            const user = results[0];
            if (user.pw !== pw) {
                // 비밀번호가 일치하지 않는 경우
                res.json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
            } else {
                // 로그인 성공
                req.session.uid = user.id;
                req.session.isLogined = true;

                req.session.save((err) => {
                    if (err) {
                        console.error('세션 저장 실패: ', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                });
                res.json({ success: true, message: '로그인 성공', user: results[0] });
            }
        }

        // 신고횟수
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return;
        } else {
            res.json({ success: true, message: '로그아웃 성공' });
        }
    });
});

app.post('/delAccount', (req, res) => {
    const { id } = req.body;
    const sql = `DELETE FROM userinfo WHERE id=?`;
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return;
        } else {
            connection.query(sql, [id], (err, results) => {
                if (err) {
                    console.error('쿼리 실행 실패:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.json({ success: true });
            });
        }
    });
});

app.use('/images', express.static('C:/uploads')); //공유 테스트

app.post('/getSanctions', (req, res) => {
    let sql = 'SELECT my_np, img_path, other_np, date FROM report WHERE other_np = ?';
    let userName = req.body.userName;

    connection.query(sql, [userName], (err, results) => {
        if (err) throw err;
        console.log(results);
        res.json({ results: results });
    });
});

app.post('/accel', (req, res) => {
    //급가속 0
    const insertSql = `INSERT INTO accelerator(user, time, accel) VALUES(?, ?, ?)`;
    const { user, time, accel } = req.body; // userName, time, accel 값을 req.body에서 가져옵니다.

    connection.query(insertSql, [user, time, accel], (errInsert, resultInsert) => {
        if (errInsert) {
            console.error('데이터 저장 실패', errInsert);
            res.json({
                success: false,
                message: 'Internal Server Error',
            });
            return;
        }
        if (accel == 0) {
            console.log('급가속 데이터 저장 성공');
        } else if (accel == 1) {
            console.log('급감속 데이터 저장 성공');
        } else if (accel == 2) {
            console.log('과속 데이터 저장 성공');
        }
        res.json({
            success: true,
            message: 'Data saved successfully',
        });
    });
});
