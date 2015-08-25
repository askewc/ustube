var socket = io();
  
$(function(){
  function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  }
  
  var src = qs('src') || prompt("Please enter video src");
  var id = btoa(src);
  var user = 'user' + Math.round(100 * Math.random()) + Date.now() + '' 
      + Math.round(10000000 * Math.random());

  if (src != null) {
    $('#video').attr('src',src);
    $('#video').load();
  }

  $('form').submit(function() {
    if (!$('#m').val()) {
      return false;
    }
    socket.emit('chat message', user + '#' + id + '#msg#' +
         $('#m').val());
    $('#m').val('');
    return false;
  });	

  $('#video').on('play', function(){
    socket.emit('chat message', user + '#' + id + '#play#' 
        + $('#video').get(0).currentTime);
    return false;
  });

  $('#video').on('pause', function(){
    socket.emit('chat message', user + '#' + id + '#pause#' 
        + $('#video').get(0).currentTime);
    return false;
  });

  socket.on('chat message', function(msg){
    var parts = msg.split('#');
    
    var _user = parts[0];
    var _id = parts[1];
    var _action = parts[2];
    var _time = parts[3] || 0;

    if (_action == 'msg') {
      var li = $('<li>');
      li.text(_time);
      if (_user == user) {
        $(li).css('color', 'rgba(180, 180, 180, .8)');
      }
      $('#messages').append(li);
      return;
    }

    if (_user == user)
      return;
    
    if (_id !== id)
      return;

    if (_action == 'play') {
      $('#video').get(0).play();
    } else if (_action == 'pause') {            
      $('#video').get(0).pause();
      $('#video').get(0).currentTime = Number(_time);
    }
  });

});