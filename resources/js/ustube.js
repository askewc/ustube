var socket = io();
  
$(function(){
  function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  }
  
  // TODO (askewc): Move this PUT.io logic to its own js file.
  var accessToken = localStorage.getItem("access_token");

  if (window.location.href.indexOf('access_token') === -1 && !qs('error')) {
    window.location = 'https://api.put.io/v2/oauth2/authenticate'
        + '?client_id=' + putIOId
        + '&response_type=token'
        + '&redirect_uri=' + window.location.href;
  } else if (window.location.href.indexOf('access_token') !== -1) {
    accessToken = window.location.href.split('#access_token=')[1];
    localStorage.setItem('access_token', accessToken);
  }
  
  $.get('https://api.put.io/v2/files/search/*/page/1?oauth_token=' + accessToken
      + '&type=iphone', function(response) { 
    loadVideoOptions(response['files']);
    
  });  
  
  function loadVideoOptions(videos) {
     videos.forEach(function(video) {
       var $vidOption = $('<div class="vid-option">' + 
           + '<img class="vid-option-icon" src="' + video.screenshot + '">'
           + '<div class="vid-option-title">' + video.name + '</div>'
           + '</div>');
       // TODO (askewc): Add vid picker to view, and style.
       $('#vid-picker').append($vidOption);
       $vidOption.click(function() {
         // TODO (askewc): Flesh this out?
       });  
     });
  }
  var src = qs('src');
  var id = btoa(src);
  var user = 'user' + Math.round(100 * Math.random()) + Date.now() + '' 
      + Math.round(10000000 * Math.random());

  if (src != null) {
    $('#video').attr('src',src);
    $('#video').load();
  }

  $('input').focus(function(){
    $('#chat-window').addClass('isActive');
  });

  $('input').focusout(function(){
    $('#chat-window').removeClass('isActive');
  });

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
    $('#chat-window').removeClass('isActive');
    return false;
  });

  $('#video').on('pause', function(){
    socket.emit('chat message', user + '#' + id + '#pause#' 
        + $('#video').get(0).currentTime);
    $('#chat-window').addClass('isActive');
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
      $('input').focus();
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
