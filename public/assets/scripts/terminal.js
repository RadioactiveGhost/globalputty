let tmButton = document.getElementById('tmButton');
let pvrButton = document.getElementById('pvrButton');
let stopButton = document.getElementById('stopButton');
let clearButton = document.getElementById('clearButton');
let quitButton = document.getElementById('quitButton');
function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*let menuOptions = [
    [1, 'Control de Enlace (Enq)'],
    [2, 'Orden de Configuracion Global'],
    [3, 'Orden de Cambio de Parametros de Operacion'],
    [4, 'Orden de Reset'], -
    [5, 'Orden de Establecer Fecha y Hora'],
    [6, 'Peticion de Datos de Ultimo Periodo de Integracion'],
    [7, 'Peticion de Datos Historicos de Periodo'],
    [8, 'Peticion de Configuracion Global'],
    [9, 'Peticion de Parametros de Operacion'],
    [10, 'Peticion de Estado y Alarmas'], -
    [11, 'Peticion de Fecha y Hora'], -
    [12, 'Peticion de Identificacion'],
    [13, 'Peticion de Datos Elaborados en una Hora'],
    [14, 'Peticion de Datos Elaborados en un Dia'],
    [15, 'Peticion de Datos Elaborados de varios Dias'],
    [20, 'Cambier Nivel de Traza'],
    [21, 'Cambiar Envio de Indicaciones'],
    [27, 'Activar Check Detectora'],
    [28, 'Desactivar Check Detectora'],
    [29, 'Reset General Piezos'],
    [30, 'Reset Canal Piezos']
];*/

let menuOptions = [
    [4, 'Orden de Reset'],
    [10, 'Peticion de Estado y Alarmas'],
    [11, 'Peticion de Fecha y Hora']
];

let menuGroup = document.getElementById('menuGroup');
for (i = 0; i < menuOptions.length; i++) {
    menuGroup.innerHTML += '<input class="red" type="button" value="[' + menuOptions[i][0] + '] ' + menuOptions[i][1] + '" onclick="menu(' + menuOptions[i][0] + ')">';
}

let socket = io();
socket.emit('startSSH')

var terminalContainer = document.getElementById('terminal-container');
const term = new Terminal({ cursorBlink: true });
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(terminalContainer);
fitAddon.fit();
socket.on('connect', function () {
    term.write('\r\n- Ligado ao servidor\r\n');
    console.log('Event: ' + this.event)
});


// Backend -> Browser
socket.on('data', function (data) {
    term.write(data);
});

socket.on('showButtons', bool => {
    if (bool) {
        document.getElementById('buttonGroup').classList.add('show');
        document.getElementById('aguarde').classList.add('hide');
    }
})

socket.on('disconnect', function () { // Manually disconnects the socket
    term.write('\r\n- Utilizador Desligado do servidor\r\n');
    socket.removeAllListeners();
    socket.disconnect(true);
    socket.disconnect();
});
socket.on('redirect', (str1) => {
    window.location.replace(str1);
});
socket.on('testChannel', (str1) => {
    console.log(str1);
})

function menu(key) {
    socket.emit('data', ' /usr/local/tm/bin/tm\n');
    sleep(1000);
    socket.emit('data', key + '\n');
}

function tm() {
    if (document.getElementById('menuGroup').classList.contains('hide')) {
        //socket.emit('data', '/usr/local/tm/bin/tm\n');
        document.getElementById('menuGroup').classList.remove('hide');
        document.getElementById('menuGroup').classList.add('show');
    } else if (document.getElementById('menuGroup').classList.contains('show')) {
        //socket.emit('data', '\x03');
        document.getElementById('menuGroup').classList.remove('show');
        document.getElementById('menuGroup').classList.add('hide');
    }
}
function pvr() {
    socket.emit('data', '\x03\npvr\n');
}
function stop() {
    socket.emit('data', '\x03');
    if (document.getElementById('menuGroup').classList.contains('show')) {
        document.getElementById('menuGroup').classList.remove('show');
        document.getElementById('menuGroup').classList.add('hide');
    }
}

function clear() {
    socket.emit('data', 'clear\n');
}
function quitSSH() {
    socket.emit('data', 'logout\n');
}
tmButton.addEventListener('click', tm);
pvrButton.addEventListener('click', pvr);
stopButton.addEventListener('click', stop);
clearButton.addEventListener('click', clear);
quitButton.addEventListener('click', quitSSH);
let terminal = document.querySelector('.terminal');
terminal.setAttribute('tabindex', '-1');
terminal.classList.toggle('disabled');
let val = false;

function toggleInput() {
    document.getElementById('toggleInput').classList.toggle('disabled');
    document.getElementById('toggleInput').classList.toggle('enabled');
    terminal.classList.toggle('disabled');

    if (val) {
        val = false;
        tmButton.removeAttribute('disabled', '');
        pvrButton.removeAttribute('disabled', '');
        stopButton.removeAttribute('disabled', '');
        quitButton.removeAttribute('disabled', '');
    } else {
        val = true;
        tmButton.setAttribute('disabled', '');
        pvrButton.setAttribute('disabled', '');
        stopButton.setAttribute('disabled', '');
        quitButton.setAttribute('disabled', '');
        if (document.getElementById('menuGroup').classList.contains('show')) {
            document.getElementById('menuGroup').classList.remove('show');
            document.getElementById('menuGroup').classList.add('hide');
        }
    }
}

// Browser -> Backend
term.onKey(function (ev) {
    if (val) {
        socket.emit('data', ev.key);
    }
});