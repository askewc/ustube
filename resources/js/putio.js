function authPIO(callback){
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

    callback(videos);
  });  
}; 