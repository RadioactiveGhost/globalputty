let socket = io();
let container = document.getElementById('container');

socket.on("hello", (str1) => {
    console.log(str1);
})

socket.on("gerar", (array) => {
    for (let i = 0; i < array.length; i++) {
        container.innerHTML += "<form action='/something" + array[i][0] + "' method='post'><input type='submit' value='" + array[i][4] + "'></form>";
    }
})