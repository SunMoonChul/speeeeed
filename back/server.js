const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
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
    const { numplate } = req.body;
    // const sql = `SELECT userinfo.record, accelerator.* FROM accelerator INNER JOIN userinfo ON userinfo.numplate = accelerator.hex(aes_encrypt(?,'b')) WHERE accelerator.user = ?`;
    const sql = 'SELECT * FROM accelerator WHERE user = ?'
    // const sql = `SELECT id, AES_DECRYPT(unhex(pw), 'a'), AES_DECRYPT(unhex(numplate), 'b'), record FROM userinfo WHERE userinfo.id = ?`;

    connection.query(sql, [numplate], (err, result) => {
        if (err) {
            res.json({
                success: false,
                message: err
            });
            return;
        }
        const sql5 = `SELECT record FROM userinfo WHERE AES_DECRYPT(unhex(numplate), 'b') = ?`;
        connection.query(sql5, [numplate], (err5, records) => {
            if (err5) {
                res.json({
                    success: false,
                    message: err5
                });
            }

            const sql2 = 'SELECT COUNT(*) FROM accelerator WHERE user = ? AND accel = 0'; //급가속 횟수
            connection.query(sql2, [numplate], (err2, upCnt) => {
                if (err2) {
                    res.json({
                        success: false,
                        message: err2
                    });
                    return;
                }
                const sql3 = 'SELECT COUNT(*) FROM accelerator WHERE user = ? AND accel = 1'; //급감속 횟수
                connection.query(sql3, [numplate], (err3, downCnt) => {
                    if (err3) {
                        res.json({
                            success: false,
                            message: err3
                        });
                        return;
                    }
                    const sql4 = 'SELECT COUNT(*) FROM accelerator WHERE user = ? AND accel = 2'; //급가속 횟수
                    connection.query(sql4, [numplate], (err4, overCnt) => {
                        if (err4) {
                            res.json({
                                success: false,
                                message: err4
                            });
                            return;
                        }
                        res.json({ success: true, item: result, newTotRecord: records[0].record, upCnt: upCnt[0]['COUNT(*)'], downCnt: downCnt[0]['COUNT(*)'], overCnt: overCnt[0]['COUNT(*)'] });
                    });
                });
            });
        });
    });
});


app.post('/toReport', (req, res) => {
    let sql = 'SELECT my_np, img_path, other_np, date FROM report WHERE my_np = ?';
    let userName = req.body.userName;
    connection.query(sql, [userName], (err, results) => {
        if (err) throw err;
        console.log(results);
        res.json({ results: results });
    });
});

app.post('/ReportCnt', (req, res) => {
    const { userName } = req.body;
    let sql = 'SELECT COUNT(*) as count FROM report WHERE my_np = ?';

    connection.query(sql, [userName], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json({ success: true, reportCnt: results[0].count });
    });
});

app.post('/ReportedCnt', (req, res) => {
    const { userName } = req.body;
    let sql = 'SELECT COUNT(*) as count FROM report WHERE other_np = ?';

    connection.query(sql, [userName], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json({ success: true, reportedCnt: results[0].count });
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
        else if (resultCheck.length > 0) {
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

            //const insertSql = `INSERT INTO userinfo(id, pw, numplate)
            const insertSql = `INSERT INTO userinfo(id, pw, numplate) VALUES(?, hex(aes_encrypt(?,'a')), hex(aes_encrypt(?,'b')) )`;
            connection.query(insertSql, [id, password, numplate], (errInsert, resultInsert) => {
                if (errInsert) {
                    console.error('데이터 저장 실패', errInsert);
                    res.json({
                        success: false,
                        message: 'Internal Server Error',
                    });
                    return;
                }

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

    const sql = `SELECT id, AES_DECRYPT(unhex(pw), 'a'), AES_DECRYPT(unhex(numplate), 'b'), record FROM userinfo WHERE userinfo.id = ?`;

    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('쿼리 실행 실패:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        else if (results.length === 0) {
            // 일치하는 아이디가 없는 경우
            res.json({ success: false, message: '일치하는 아이디가 없습니다.' });
            return;
        }

        const user = results[0];
        const pw2 = results[0]["AES_DECRYPT(unhex(pw), 'a')"].toString();
        const numplate2 = results[0]["AES_DECRYPT(unhex(numplate), 'b')"].toString();
        if (pw2 !== pw) {
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
        }

        let sql2 = 'SELECT COUNT(*) as count FROM report WHERE my_np = ?';

        connection.query(sql2, [numplate2], (error, results2) => {
            if (error) {
                return res.status(500).json({ error });
            }
            console.log('results2:', results2[0].count);

            let sql3 = 'SELECT COUNT(*) as count FROM report WHERE other_np = ?';
            connection.query(sql3, [numplate2], (error3, results3) => {
                if (error3) {
                    return res.status(500).json({ error3 });
                }
                console.log('results3: ', results3[0]);
                console.log(results3[0].count);
                res.json({ success: true, message: '로그인 성공', record: results[0].record, numplate: numplate2, reportCnt: results2[0].count, reportedCnt: results3[0].count });
            });
        });
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
    const { user, time, accel, record} = req.body; // userName, time, accel 값을 req.body에서 가져옵니다.
    const newTotRecord = record-3;

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

        const updateInfo = `UPDATE userinfo SET record = ? WHERE AES_DECRYPT(unhex(numplate), 'b') = ? `;
        //const np = resultInsert[0]["AES_DECRYPT(unhex(numplate), 'b')"].toString();
        connection.query(updateInfo, [newTotRecord, user], (errUpdate, result) => {
            if(errUpdate) {
                console.error('데이터 업데이트 실패', errUpdate);
                res.json({
                    success: false,
                    message: 'Internal Server Error',
                });
                return;
            } else {
                console.log('-3');
                console.log(result);
                res.json({
                    success: true,
                    newTotRecord: newTotRecord,
                });
            }
        });
    });
});
