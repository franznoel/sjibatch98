window.fbAsyncInit = function() {
  FB.init({
    appId      : '1235344773217239',
    xfbml      : true,
    version    : 'v2.1'
  });

  FB.login(function(response) {
      if (response.authResponse) {
        // console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
          console.log('Good to see you, ' + response.name + '.');
        });
      } else {
       console.log('User cancelled login or did not fully authorize.');
      }
  });

  FB.getLoginStatus(function(response) {
    var path = window.location.pathname;
    if(response.authResponse) {
      if (path=='/') {
        window.location.href = '/profile';
      }

      // Display Profile
            
    }
    console.log(response);
  });

};

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8&appId=1235344773217239";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));