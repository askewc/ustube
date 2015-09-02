
var socket = io();
var id = null; // Id of the video playing (base64'd src url)
$(function(){
  function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  }
  
  authPIO(loadVideoOptions);
  
  var loadFromUrl = function(){
    var src = prompt("Please enter video src");
    setSrc(src);
  };

  function setSrc(src) {
    if (!src || src === $('#video').attr('src')) return;
    $('#video').attr('src', src);
    $('#video').load();
    var message = user + ' has loaded a new video. To join, add their video from the url ' + src;
    socket.emit('chat message', user + '#' + id + '#msg#' +
        message);
    $('.msg').remove();
    id = btoa(src);
  }
  
  function loadVideoOptions(videos) {
     videos.forEach(function(video) {
       var $vidOption = $('<div class="vid-option">' 
           + '<span class="vid-option-title">' + video.name + '</span>'
           + '</div>');
       $vidOption.css('background-image', 'url("' + video.screenshot + '")');
       // TODO (askewc): Add vid picker to view, and style.
       $('#vid-picker .content').append($vidOption);
       
       $vidOption.click(function() {
         $('.vid-option.selected').removeClass('selected');
         $(this).addClass('selected');
         setSrc('https://put.io/v2/files/' + video.id + '/stream');
       });

     });

     $('.vid-option:first-of-type').click(loadFromUrl);

     $('#vid-picker .content').width(videos.length * $('.vid-option').first().outerWidth());
  }
  
  setSrc(qs('src'));
  
  var user = 'user' + Math.round(100 * Math.random()) + Date.now() + '' 
      + Math.round(10000000 * Math.random());

  $('input').focus(function(){
    $('#chat-window').addClass('isActive');
  });

  $('input').focusout(function(){
    $('#chat-window').removeClass('isActive');
  });

  $('form').submit(function() {
    if (!$('#m').val() || !id) {
      return false;
    }
    socket.emit('chat message', user + '#' + id + '#msg#' +
         $('#m').val());
    $('#m').val('');
    return false;
  }); 

  $('#video').on('play', function(){
    if (!id) return;
    socket.emit('chat message', user + '#' + id + '#play#' 
        + $('#video').get(0).currentTime);
    $('#chat-window').removeClass('isActive');
    return false;
  });

  $('#video').on('pause', function(){
    if (!id) return;
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
    
    if (_id !== id || !id)
      return;
    
    if (_action == 'msg') {
      var li = $('<li class="msg">');
      li.text(_time);
      if (_user == user) {
        $(li).css('color', 'rgba(180, 180, 180, .8)');
      }

      $('#messages').append(li);
      var theBottom = document.getElementById('messages').scrollHeight;
      $('#chat-window').scrollTop(theBottom);
      console.log($('#chat-window').scrollTop());
      $('input').focus();
      return;
    }

    if (_user == user)
      return;

    if (_action == 'play') {
      $('#video').get(0).play();
    } else if (_action == 'pause') {            
      $('#video').get(0).pause();
      $('#video').get(0).currentTime = Number(_time);
    }
  });

});