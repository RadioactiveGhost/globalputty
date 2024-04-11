let menuButton = document.getElementById('menuButton');
let pvrButton = document.getElementById('pvrButton');
let stopButton = document.getElementById('stopButton');
let clearButton = document.getElementById('clearButton');
let quitButton = document.getElementById('quitButton');
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

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
    [4, 'Reset'],
    [10, 'Alarmes'],
    [11, 'Data e hora']
];

let menuGroup = document.getElementById('menuGroup');
for (i = 0; i < menuOptions.length; i++) {
    menuGroup.innerHTML += '<input class="red" type="button" style="text-align: center; width: 160px; height: 40px; border-radius: 20px; font-size: 1em; margin-left: -15px" value="' + menuOptions[i][1] + '" onclick="menu(' + menuOptions[i][0] + ')">';
}

let socket = io();
socket.emit('startSSH')

var terminalContainer = document.getElementById('terminal-container');
const term = new Terminal({ cursorBlink: true });
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(terminalContainer);
fitAddon.fit();
socket.on('connect', () => {
    term.write('\r\n- Ligado ao servidor\r\n');
    toggleConnected();
});
socket.on('data', (data) => {
    term.write(data);
});
socket.on('showButtons', bool => {
    if (bool) {
        document.getElementById('buttonGroup').classList.add('show');
        document.getElementById('aguarde').classList.add('hide');
    }
});
socket.on('disconnect', () => { // Manually disconnects the socket
    term.write('\r\n- Utilizador Desligado do servidor\r\n');
    socket.removeAllListeners();
    socket.disconnect(true);
    socket.disconnect();
});
socket.on('warning', () => {
    document.getElementById('aguarde').innerHTML = `<span style="font-size: 0.7em"> Ocorreu um erro ao tentar
    <br>
    ligar ao dispositivo.
    <br>
    Tentar novamente?
    <br><br> </span>
    <input style="margin-right: 5px; width: 100px; height: 25px; font-weight: bold; color: #0f3866" type='button' value='Sim' onclick='location.reload()'><input style="margin-right: 5px; width: 100px; height: 25px; font-weight: bold; color: #0f3866" type='button' value='Sair' onclick='history.go(-1); return false;'>`;
});
socket.on('redirect', (str1) => {
    window.location.replace(str1);
});

async function menu(key) {
    socket.emit('data', ' /usr/local/tm/bin/tm\n');
    await sleep(500);
    socket.emit('data', key + '\n');
    await sleep(500);
    socket.emit('data', '\x03');
}
function openMenu() {
    if (document.getElementById('menuGroup').classList.contains('hide')) {
        menuButton.classList.add('active');
        //socket.emit('data', '/usr/local/tm/bin/tm\n');
        document.getElementById('menuGroup').classList.remove('hide');
        document.getElementById('menuGroup').classList.add('show');
    } else if (document.getElementById('menuGroup').classList.contains('show')) {
        menuButton.classList.remove('active');
        //socket.emit('data', '\x03');
        document.getElementById('menuGroup').classList.remove('show');
        document.getElementById('menuGroup').classList.add('hide');
    }
}
function runPVR() {
    socket.emit('data', '\x03\npvr\n');
    stopButton.removeAttribute('disabled', '');
    menuButton.setAttribute('disabled', '');
    clearButton.setAttribute('disabled', '');
    pvrButton.classList.add('active');
    if (document.getElementById('menuGroup').classList.contains('show')) {
        document.getElementById('menuGroup').classList.remove('show');
        document.getElementById('menuGroup').classList.add('hide');
    }
}
function stopCommand() {
    socket.emit('data', '\x03\n');
    /*if (document.getElementById('menuGroup').classList.contains('show')) {
        document.getElementById('menuGroup').classList.remove('show');
        document.getElementById('menuGroup').classList.add('hide');
    }*/
    pvrButton.classList.remove('active');
    stopButton.setAttribute('disabled', '');
    menuButton.removeAttribute('disabled', '');
    clearButton.removeAttribute('disabled', '');
}
function clearScreen() {
    socket.emit('data', 'clear\n');
}
async function quitSSH() {
    socket.emit('data', '\x03');
    await sleep(500);
    socket.emit('data', 'logout\n');
    toggleConnected();
}
menuButton.addEventListener('click', openMenu);
pvrButton.addEventListener('click', runPVR);
stopButton.addEventListener('click', stopCommand);
clearButton.addEventListener('click', clearScreen);
quitButton.addEventListener('click', quitSSH);
let connected = 0;
let discButtons = document.getElementById('disconnectedButtons');
let connButtons = document.getElementById('connectedButtons')
let terminal = document.querySelector('.terminal');
terminal.setAttribute('tabindex', '-1');
terminal.classList.toggle('disabled');
let val = false;

function toggleConnected() {
    if (connected) {
        connected = 0;
        discButtons.style.display = 'block';
        discButtons.classList.remove('hide');
        connButtons.classList.add('hide');
        openMenu();
    } else {
        connected = 1;
        discButtons.style.display = 'none';
        connButtons.classList.remove('hide');
    }
}

function toggleInput() {
    document.getElementById('toggleInput').classList.toggle('disabled');
    document.getElementById('toggleInput').classList.toggle('enabled');
    terminal.classList.toggle('disabled');

    if (val) {
        val = false;
        menuButton.removeAttribute('disabled', '');
        pvrButton.removeAttribute('disabled', '');
        stopButton.removeAttribute('disabled', '');
        quitButton.removeAttribute('disabled', '');
    } else {
        val = true;
        menuButton.setAttribute('disabled', '');
        pvrButton.setAttribute('disabled', '');
        stopButton.setAttribute('disabled', '');
        quitButton.setAttribute('disabled', '');
        if (document.getElementById('menuGroup').classList.contains('show')) {
            document.getElementById('menuGroup').classList.remove('show');
            document.getElementById('menuGroup').classList.add('hide');
        }
    }
}

term.onKey(function (ev) {
    if (val) {
        socket.emit('data', ev.key);
    }
});