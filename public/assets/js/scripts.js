var checkAuth = function() {
  var auth = firebase.auth();
  console.log(auth);

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) { // User is signed in.
      var user = JSON.parse(JSON.stringify(user)),
        accessToken = user.stsTokenManager.accessToken;

      console.log(user);

      // $.ajax({
      //   url: 'https://graph.facebook.com/v2.8/me',
      //   data: {
      //     'access_token': user.uid,
      //     'fields': 'user_birthday,user_hometown,user_location,user_education_history,user_work_history,user_about_me,user_status,read_page_mailboxes,email,manage_pages,public_profile'
      //   },
      //   success: function(response) {
      //     console.log(response);
      //   }
      // })

      // console.log(user);
      $('#email').val(user.email);
      $('#displayName').val(user.displayName);
      $('#username').html(user.email+'<span class="caret"></span>');
      $('#facebook-profile').attr('href','https://www.facebook.com/'+user.providerData[0].uid)
      // console.log(user_json);
      // console.log(user.credential.accessToken);
      $('#default-image').attr('src',user.photoURL);

    } else { // No user is signed in.
      console.log('No user signed in.');
      window.location.href='/';
    }
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
