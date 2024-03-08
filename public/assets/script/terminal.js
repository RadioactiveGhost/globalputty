let neo = document.getElementById('neoButton');
let quitB = document.getElementById('quitButton');
/* neo.disabled = true;
quitB.disabled = true; */
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
    function helloWorld() {
        socket.emit('data', 'neofetch\n');
    }
    function quitSSH() {
        //await sleep(2000);
        socket.emit('data', 'exit\n');
        socket.disconnect(true);
        neo.disabled = true;
        quitB.disabled = true;
        //socket.removeAllListeners();
    }
    neo.addEventListener('click', helloWorld);
    quitB.addEventListener('click', quitSSH);
})
let start = document.getElementById('start');
function doSomething(string) {
    $.ajax({
        type: 'POST',
        url: '/something'+string
    })
    neo.disabled = false;
    quitB.disabled = false;
}