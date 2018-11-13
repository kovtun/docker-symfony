'use strict';

(function() {

  var socket = io({
      transports: ['websocket']
  });
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');
  socket.emit('name message',  prompt('Enter a string containing numbers separated by spaces'));

  var current = {
    color: 'black'
  };
  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);

  window.addEventListener('resize', onResize, false);
  onResize();
    $('form').submit(function(){
        var msg = $('#m').val();
        socket.emit('chat message', msg);
        $('#m').val('');
        $('#messages').append($('<li style="color: blue">').text(msg));
        $messages.scrollTop($messages[0].scrollHeight);
        return false;
    });
    socket.on('chat message', function(msg){
        let $messages = $('#messages');
        $messages.append($('<li>').text(moment(JSON.parse(msg).createdAt).format() + '|'+ JSON.parse(msg).from+": "+JSON.parse(msg).content));
        $messages.scrollTop($messages[0].scrollHeight);
    });


  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
  }

  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
      data = JSON.parse(data).content;
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
    WowzaPlayer.create('playerElement',
        {
            "license":"PLAY1-jKkeC-yjjbE-U49HM-J86fc-Z8czm",
            "title":"test007",
            "description":"",
            "sourceURL":"http%3A%2F%2F192.168.66.62%3A10083%2F%2Flive%2Ftest007%2Fplaylist.m3u8",
            "autoPlay":false,
            "volume":"75",
            "mute":false,
            "loop":false,
            "audioOnly":false,
            "uiShowQuickRewind":true,
            "uiQuickRewindSeconds":"30"
        }
    );
})();
