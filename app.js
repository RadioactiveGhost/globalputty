//* Implementação dos Módulos do NodeJS ---
const express = require('express');
const http = require('http');
const url = require('url');
const path = require('path');
const { engine } = require('express-handlebars');
const { equipamentoLista } = require('./server/adr.js');
const {cctvLista1, cctvLista2, cctvLista3, cctvLista4, cctvCAM, cctvIP2} = require('./server/cctv.js');
const SSHClient = require('ssh2').Client;
/* ------------------------------------- */

//* Variáveis -----------------------------
const port = 8888;
const app = module.exports.app = express();
const log = console.log;
const server = http.createServer(app);
const io = require('socket.io')(server);
let sshost = '';
let ssport = '';
let ssusername = '';
let sspassword = '';
/* ------------------------------------- */

/*
* Declarações para o express.js -----------
*Tratam de encaminhamento de ficheiros ----
*/
app.set('view engine', 'handlebars');
app.engine('handlebars', engine({
    layoutsDir: __dirname + '/views/layouts',
    defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials/'
}));
app.use("/modules", express.static(__dirname + "/node_modules"));
app.use(express.static('public'));
/* ------------------------------------- */

//* Conexão SSH ---------------------------
function sshConnection(socket) {
    let conn = new SSHClient();
    conn.on('ready', function () {
        socket.emit('data', '\r\n- Conexão estabelecida \r\n');
        //* Mostra os botões de interação quando liga com sucesso 
        socket.emit('showButtons', true);
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
        //socket.emit('redirect', '/');
    }).on('error', function (err) {
        socket.emit('warning', err.message);
        console.log('Error: ' + err.message);
        //socket.emit('data', '\r\n- Erro de Conexão: ' + err.message + '/!\\\r\n');
    });
    console.log('A user connected');
    socket.on('disconnect', function () {
        console.log('A user disconnected');
        io.off('connection', ioConnection);
        conn.off('disconnect', sshConnection);
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
}
/* ---------------------------------- */

//* Encaminhamento de endereços -----------

app.get('/', (req, res) => {
    res.render('index', {title: 'GlobalPuTTY'});
});
app.get('/a4', (req, res) => {
    res.render('a4', {layout: 'submenu', title: 'GlobalPuTTY - CCTV A4'});
});
app.get('/a4_1', (req, res) => {
    res.render('cctvtemplate', {layout: 'devices', title: 'GlobalPuTTY - CCTV A4 - 1', subtitle: 'CCTV 89 &rarr; 122', backAction: 'a4', bodyClass:'a4_1', lista: cctvLista1, listExists: true});
});
app.get('/a4_2', (req, res) => {
    res.render('cctvtemplate', {layout: 'devices', title: 'GlobalPuTTY - CCTV A4 - 2', subtitle: 'CCTV 123 &rarr; 168', backAction: 'a4', bodyClass:'a4_2', lista: cctvLista2, listExists: true});
});
app.get('/a4_3', (req, res) => {
    res.render('cctvtemplate', {layout: 'devices', title: 'GlobalPuTTY - CCTV A4 - 3', subtitle: 'CCTV 170 &rarr; 193', backAction: 'a4', bodyClass:'a4_3', lista: cctvLista3, listExists: true});
});
app.get('/a4_4', (req, res) => {
    res.render('cctvtemplate', {layout: 'devices', title: 'GlobalPuTTY - CCTV A4 - 1', subtitle: 'CCTV 194 &rarr; 222', backAction: 'a4', bodyClass:'a4_4', lista: cctvLista4, listExists: true});
});
app.get('/adr', (req, res) => {
    res.render('adr', {layout: 'devices', title: 'GlobalPuTTY - ADR', lista: equipamentoLista, listExists: true});
});
app.get('/cams', (req, res) => {
    res.render('cctvtemplate', {layout: 'devices', title: 'GlobalPuTTY - CCTV CAMs', subtitle: 'CAMs', backAction: 'cctv', bodyClass:'cams', lista: cctvCAM, listExists: true});
});
app.get('/cctv', (req, res) => {
    res.render('cctv', {layout: 'submenu', title: 'GlobalPuTTY - CCTV'});
});
app.get('/ip2', (req, res) => {
    res.render('cctvtemplate', {layout: 'devices', title: 'GlobalPuTTY - CCTV IP2', subtitle: 'Itinerário Principal 2', backAction: 'cctv', bodyClass: 'ip2', lista: cctvIP2, listExists: true});
});
app.get('/equipamento_:id', (req, res) => {
    log ('Selected Equipment: ' + req.params.id);
    let i = 0
    for (i = 0; i < equipamentoLista.length; i++) {
        if (req.params.id === equipamentoLista[i].pk) {
            log('Type: ' + equipamentoLista[i].host + ' | ' + i);
            sshost = equipamentoLista[i].host;
            ssport = equipamentoLista[i].port;
            ssusername = equipamentoLista[i].user;
            sspassword = equipamentoLista[i].pass;
            break;
        }
    }
    io.on('connection', ioConnection);
    res.render('terminal', {nome: 'ADR ' + equipamentoLista[i].pk + ' - ' + equipamentoLista[i].sublanco, layout: false});
});

app.get('*', function (req, res) {
    res.redirect('/');
});
/* --------------------------------------*/

//* Iniciar o Server ----------------------
server.listen(port, () => {
    console.log(`App listening to port ${port}`);
});