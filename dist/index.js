'use strict';

var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var PDFDocument = require('pdfkit');
var blobStream = require('blob-stream');

//Create connection
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodemysql'
});

db.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log('MySQL connected');
});

var app = express();

/*
 app.get('/createdb', (req,res) => {
     let sql = 'CREATE DATABASE nodemysql';
     db.query(sql, (err, result) => {
         if (err) throw err;
         console.log(result);
         res.send('DB created');
     });
 });
*/

app.get('/createusertable', function (req, res) {
    var sql = 'CREATE TABLE user(' + 'id int NOT NULL AUTO_INCREMENT, ' + 'firstName VARCHAR(32) NOT NULL, ' + 'lastName VARCHAR(32) NOT NULL, ' + 'image blob, pdf blob, ' + 'PRIMARY KEY (id), ' + 'UNIQUE KEY (firstName))';
    db.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.send('User table created');
    });
});

app.get('/adduser', function (req, res) {
    var user = { firstName: 'July', lastName: 'Bgdn', image: fs.readFileSync('D:\\pic1.jpg') };
    var sql = 'INSERT INTO user SET ?';
    db.query(sql, user, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.send('User added');
    });
});

app.get('/getuser/:id', function (req, res) {
    var sql = 'SELECT * FROM user WHERE firstName=\'' + req.params.id + '\'';
    db.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result[0]);
        res.send('User fetched');
    });
});

app.get('/createPDFfor/:id', function (req, res) {
    var sql = 'SELECT * FROM user WHERE firstName=\'' + req.params.id + '\'';
    db.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result[0]);
        var doc = new PDFDocument();
        // let stream = doc.pipe(blobStream());
        var filename = result[0].firstName;
        filename = encodeURIComponent(filename) + '.pdf';

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        var content = result[0].firstName + ' ' + result[0].lastName;
        doc.y = 300;
        doc.text(content, 50, 50);
        doc.pipe(res);
        doc.end();
        /*        let blob;
                stream.on('finish', function (){
                    blob = stream.toBlob('application/pdf');
                });*/

        var sql1 = 'UPDATE user SET pdf=\'' + doc.toString() + '\' WHERE firstName=\'' + req.params.id + '\'';
        db.query(sql1, function (err, result) {
            if (err) throw err;
            console.log(result[0]);
        });
    });
});

app.listen(3000, function () {
    console.log('Server started on port 3000');
});
//# sourceMappingURL=index.js.map