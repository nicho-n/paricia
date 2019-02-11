function connect(){
    var socket = io();
    var message = document.getElementById("input");

    socket.on('connect', function() {
        socket.emit('newuser', username);
    });

    $("input").keypress(function(event){
      if (event.which == 13 && message === document.activeElement){
        socket.emit('message', 'user: ' + message.value);
        message.value = "";
        return false;
      }
    });
    socket.on('message', function(msg){
      $('#box').append(msg + '<br>');
    });
}

