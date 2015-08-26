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
    var videos = [];
    response.files.forEach(function(file) {
      if (file.is_mp4_available) {
        videos.push(file);
      }
    }); 
    loadVideoOptions(videos);
  });  
  
  var loadFromUrl = function(){
    var src = prompt("Please enter video src");
    $('.vid-option.selected').removeClass('selected');
    $('#video').attr('src',src);
    $('#video').load();
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
         $('#video').attr('src', 'https://put.io/v2/files/' + video.id + '/stream');
         $('#video').load();
       });

     });

     $('.vid-option:first-of-type').click(loadFromUrl);

     $('#vid-picker .content').width(videos.length * $('.vid-option').first().outerWidth());
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

  $('#video').on('load', function(){
    var message = user + id + ' has loaded a new video. To join, add their video from the url ' + $('#video').attr('src');
    socket.emit('chat message', user + '#' + id + '#msg#' +
        message);
    return false;
  });

  // TODO (imafeature): Make chat window scroll to new message upon receipt
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
      // $('#messages').scrollTop = $('#messages').scrollHeight + li.height;
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
