var checkAuth = function() {
  var auth = firebase.auth();
  // console.log(auth);

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
      $('#email').text(user.email);
      $('#fullName').text(user.name);
      $('#birthdate').text(user.birthday);
      $('#hometown').text(user.hometown.name);
      $('#location').text(user.location.name);
      $('#about').text(user.about);
      $('#username').html('Hello, '+ user.name +'<span class="caret"></span>');
      $('#facebook-profile').attr('href','https://www.facebook.com/'+user.id)

      var work_info = user.work
      if (work_info) {
        var workHtml = '';
        for(var i=0;i<work_info.length;i++) {
          var w = work_info[i];
          workHtml+= '<h3>'+ w.employer.name +' <small>'+ w.location.name +'</small></h3>';
          workHtml+= '<div>'+ w.position.name +' </div>';
          workHtml+= '<p>Start Date: '+ w.start_date +'</p>'
          workHtml+= '<hr/>';
        }
        $('#professions').html(workHtml);
      }
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