//* Implementação dos Módulos do NodeJS ---
const express = require('express');
const http = require('http');
const url = require('url');
const path = require('path');
const { engine } = require('express-handlebars');
const { equipamentoLista } = require('./server/variables.js')
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
        socket.emit('redirect', '/');
    }).on('error', function (err) {
        console.log('Error: ' + err.message);
        socket.emit('data', '\r\n- Erro de Conexão: ' + err.message + '/!\\\r\n');
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
    res.render('home', {equipamentoLista: equipamentoLista, listExists: true});
});
app.get('/about', (req, res) => {
    res.render('about');
});
app.post('/equipamento_:id', (req, res) => {
    log ('Selected Equipment: ' + req.params.id);
    for (let i = 0; i < equipamentoLista.length; i++) {
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
    res.render('terminal');
})

app.get('*', function (req, res) {
    res.redirect('/');
});
/* --------------------------------------*/

//* Iniciar o Server ----------------------
server.listen(port, () => {
    console.log(`App listening to port ${port}`);
});