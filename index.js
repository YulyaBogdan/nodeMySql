const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const PDFDocument = require('pdfkit')
const blobStream  = require ('blob-stream');

//Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodemysql'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL connected');
});

const app = express();

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

 app.get('/createusertable', (req,res) => {
     let sql = 'CREATE TABLE user(' +
         'id int NOT NULL AUTO_INCREMENT, ' +
         'firstName VARCHAR(32) NOT NULL, ' +
         'lastName VARCHAR(32) NOT NULL, ' +
         'image blob, pdf blob, ' +
         'PRIMARY KEY (id), ' +
         'UNIQUE KEY (firstName))';
     db.query(sql, (err, result) => {
         if (err) throw err;
         console.log(result);
         res.send('User table created');
     });
 });

app.get('/adduser', (req,res) => {
    let user = {firstName: 'July', lastName: 'Bgdn', image: fs.readFileSync('D:\\pic1.jpg')}
    let sql = 'INSERT INTO user SET ?';
    db.query(sql, user, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('User added');
    });
});

app.get('/getuser/:id', (req,res) => {
    let sql = `SELECT * FROM user WHERE firstName=\'${req.params.id}\'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result[0]);
        res.send('User fetched');
    });
});

app.get('/createPDFfor/:id', (req,res) => {
    let sql = `SELECT * FROM user WHERE firstName=\'${req.params.id}\'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result[0]);
        let doc = new PDFDocument();
       // let stream = doc.pipe(blobStream());
        let filename = result[0].firstName;
        filename = encodeURIComponent(filename) + '.pdf';

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
        res.setHeader('Content-type', 'application/pdf');

        const content = result[0].firstName + ' ' + result[0].lastName;
        doc.y = 300;
        doc.text(content, 50, 50);
        doc.pipe(res);
        doc.end();
/*        let blob;
        stream.on('finish', function (){
            blob = stream.toBlob('application/pdf');
        });*/

        let sql1 = `UPDATE user SET pdf='${doc.toString()}' WHERE firstName=\'${req.params.id}\'`;
        db.query(sql1, (err, result) => {
            if (err) throw err;
            console.log(result[0]);
        });
    });

});

app.listen(3000, () => {
    console.log('Server started on port 3000');
})