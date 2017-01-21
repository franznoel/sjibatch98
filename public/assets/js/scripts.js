var checkAuth = function() {
  var auth = firebase.auth();
  console.log(auth);

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) { // User is signed in.
      var user = JSON.parse(JSON.stringify(user)),
        accessToken = user.stsTokenManager.accessToken;

      var path = window.location.pathname;

      switch(path) {
        case '/profile':
        case '/profile/':
        case '/profile.html':
          displayProfile();
          break;
      }

    } else { // No user is signed in.
      console.log('No user signed in.');
      window.location.href='/';
    }
  });
}

var displayProfile = function() {
  var params = '?fields=id,name,first_name,last_name,email,birthday,hometown,location,about,education,work';
      params+= '&access_token=' + getCookie('token');

  fetch('https://graph.facebook.com/v2.8/me'+params,{
      method: 'GET',
      headers: new Headers(),
      mode: 'cors',
      cache: 'default',
    }).then(function(response) {
      return response.json();
    }).then(function(json_response) {
      console.log('Profile:',json_response);
      var user = json_response;
      $('#email').val(user.email);
      $('#displayName').val(user.displayName);
      $('#birthdate').val(user.hometown.name);
      $('#hometown').val(user.hometown.name);
      $('#location').val(user.location.name);
      $('#about').val(user.about);
      $('#username').html(user.email+'<span class="caret"></span>');
      $('#facebook-profile').attr('href','https://www.facebook.com/'+user.id)
      // $('#default-image').attr('src',user.photoURL);
    }).catch(function(response) {
      console.log('Error: ',response);
    });
}

var signOut = function() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    window.location.href='/logout.html';
  }, function(error) {
    // An error happened.
    console.log('Error:',error);
  });
}

var facebookSignOut = function() {
  FirebaseAuth.getInstance().signOut();    
}