// Implementação dos Módulos do NodeJS
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const app = module.exports.app = express();
const engines = require('consolidate');
const ejs = require('ejs');
let server = http.createServer(app);
const url = require('url');
const bodyParser = require('body-parser');
const io = require('socket.io')(server);
let os = require('os');
require('dotenv-safe').config();
session = require('express-session')({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
});
sharedsession = require("express-socket.io-session");
app.use(session);
const SSHClient = require('ssh2').Client;
/* ------------------------------------- */

//* Porta a aceder ao website--------------
const serverPort = 8888;

/* Declarações para o express.js-------- */
/* Trata de encaminhamento de ficheiros- */
app.use("/", express.static(__dirname + "/public"));
app.use("/modules", express.static(__dirname + "/node_modules"));
app.set('views', __dirname + '/public/');
app.engine('html', engines.ejs);
app.set('view engine', 'html');
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.urlencoded({
    extended: true
}));
/* ------------------------------------- */

const log = console.log;
let sshost = '';
let ssport = '';
let ssusername = '';
let sspassword = '';

io.use(sharedsession(session));

//* Conexão SSH ---------------------------
function sshConnection(socket) {
    let conn = new SSHClient();
    conn.on('ready', function () {
        socket.emit('data', '\r\n- Conexão estabelecida \r\n');
        conn.shell(function (err, stream) {
            if (err) {
                return socket.emit('data', '\r\n- Erro de SSH: ' + err.message + ' /!\\\r\n');
            }
            socket.on('data', function (data) {
                stream.write(data);
            });
            stream.on('data', function (d) {
                socket.emit('data', d.toString('binary'));
            }).on('close', function () {
                conn.end();
            });
        });
    }).on('close', function () {
        console.log('Closed');
        socket.emit('data', '\r\n- Conexão fechada\r\n');
    }).on('error', function (err) {
        console.log('Error: ' + err.message);
        socket.emit('data', '\r\n- Erro de Conexão: ' + err.message + '/!\\\r\n');
    }).on('disconnect', function () {
        console.log('Disconnected');
    });
    console.log('A user connected');
    socket.on('disconnect', function () {
        console.log('A user disconnected');
        io.off('connection', ioConnection);
        conn.off('disconnect', sshConnection);
        socket.disconnect();
        socket.removeAllListeners();
    });
    conn.connect({
        host: sshost,
        port: ssport,
        username: ssusername,
        password: sspassword
    });
};

function ioConnection(socket) {
    sshConnection(socket);
};
/* ---------------------------------- */

//* Encaminhamento de endereços -----------
app.get('/', (req, res) => {
    res.render('index.html');
});

app.post('/test', (req, res) => {
    let name = req.body.name;
    res.render('test.html', { name: name });
});

app.get('/terminal', (req, res) => {
    io.on('connection', ioConnection);
    res.render('terminal.html');
});
app.post('/linux', (req, res) => {
    sshost = process.env.CON1HOST;
    ssport = process.env.CON1PORT;
    ssusername = process.env.CON1USER;
    sspassword = process.env.CON1PASS;

    io.on('connection', ioConnection);
    res.render('terminal.html');
});

app.post('/android', (req, res) => {
    sshost = process.env.CON2HOST;
    ssport = process.env.CON2PORT;
    ssusername = process.env.CON2USER;
    sspassword = process.env.CON2PASS;

    io.on('connection', ioConnection);
    res.render('terminal.html');
});

app.post('/something:id', (req, res) => {

    console.log('success: ' + req.params.id)
    res.status(200)
    if (req.params.id == 'android') {
        sshost = process.env.CON2HOST;
        ssport = process.env.CON2PORT;
        ssusername = process.env.CON2USER;
        sspassword = process.env.CON2PASS;
    }
    else {
        sshost = process.env.CON1HOST;
        ssport = process.env.CON1PORT;
        ssusername = process.env.CON1USER;
        sspassword = process.env.CON1PASS;
    }
    console.log(sshost);
    res.end();
});

app.get('*', function (req, res) {
    res.redirect('/');
});
/* --------------------------------------*/

//* Iniciar o Server ----------------------
server.listen(serverPort, () => {
    log("Serviço iniciado em :" + serverPort)
});