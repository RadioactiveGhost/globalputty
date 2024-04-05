let tmButton = document.getElementById('tmButton');
let pvrButton = document.getElementById('pvrButton');
let stopButton = document.getElementById('stopButton');
let quitButton = document.getElementById('quitButton');
function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function() {
    let socket = io();

    socket.emit('startSSH')

    var terminalContainer = document.getElementById('terminal-container');
    const term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalContainer);
    fitAddon.fit();
    socket.on('connect', function() {
        term.write('\r\n- Ligado ao servidor\r\n');
        console.log('Event: ' + this.event)
    });
    
    // Browser -> Backend
    term.onKey(function (ev) {
        socket.emit('data', ev.key);
    });
    
    // Backend -> Browser
    socket.on('data', function(data) {
        term.write(data);
    });
    
    socket.on('disconnect', function() { // Manually disconnects the socket
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
    function tm() {
        socket.emit('data', '/usr/local/tm/bin/tm\n');
    }
    function pvr() {
        socket.emit('data', 'pvr\n');
    }
    function stop() {
        socket.emit('data', '\x03');
    }
    function quitSSH() {
        socket.emit('data', 'logout\n');
        /*socket.disconnect(true);
        neo.disabled = true;
        quitB.disabled = true;
        console.log("Rip?");*/
    }
    tmButton.addEventListener('click', tm);
    pvrButton.addEventListener('click', pvr);
    stopButton.addEventListener('click', stop);
    quitButton.addEventListener('click', quitSSH);
});