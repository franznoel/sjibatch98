var checkAuth = function() {
  var auth = firebase.auth();

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
        case '/roster':
        case '/roster/':
        case '/roster.html':
          displayRoster();
          break;
      }

    } else { // No user is signed in.
      console.log('No user signed in.');
      window.location.href='/';
    }
  });
}

var displayProfile = function() {
  var access_token = getCookie('token');
    params = '?fields=id,name,photos,first_name,last_name,email,birthday,hometown,location,about,education,work';
    params+= '&access_token=' + access_token;

  getProfile(params,access_token);
}

var getProfile = function(params,access_token) {
  fetch('https://graph.facebook.com/v2.8/me'+params,{
      method: 'GET',
      headers: new Headers(),
      mode: 'cors',
      cache: 'default',
    }).then(function(response) {
      return response.json();
    }).then(function(json_response) {
      var user = json_response;
      getProfilePicture(user.id,access_token);
      $('#email').text(user.email);
      $('#fullName').text(user.name);
      $('#birthdate').text(user.birthday);
      $('#hometown').text(user.hometown.name);
      $('#location').text(user.location.name);
      $('#about').text(user.about);
      $('#username').html('Hello, '+ user.first_name +' <span class="caret"></span>');
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

      var education_info = user.education
      if (education_info) {
        var eduHtml = '';
        for(var i=0;i<education_info.length;i++) {
          var e = education_info[i];
          eduHtml+= '<div class="well well-sm">';
          eduHtml+= '<strong>'+ e.school.name + '</strong><br/>';
          eduHtml+= '<strong>Type:</strong> '+ e.type + '<br/>';
          eduHtml+= '<strong>Year Graduated:</strong> '+ e.year.name;
          eduHtml+= '</div>';
        }
        $('#education').html(eduHtml);
      }
      updateUser(user);
    }).catch(function(response) {
      console.log('Error: ',response);
    });  
}

var getProfilePicture = function(id,token) {
  var params = 'height=165&width=165&type=large&redirect=true`';
  fetch('https://graph.facebook.com/v2.8/'+id+'/picture',{
      method: 'GET',
      headers: new Headers(),
      mode: 'cors',
      cache: 'default',
    }).then(function(response) {
      return response.blob();
    }).then(function(profilePicture) {
      var profilePhotoUrl = URL.createObjectURL(profilePicture);
      $('#default-image').attr('src',profilePhotoUrl);
    }).catch(function(response) {
      console.log('Error: ',response);
    });
}

var updateUser = function(user) {
  var member = user;
  var memberKey = firebase.database().ref().child('members').push().key;
  var memberUpdates = {};
  memberUpdates['/members/'+user.id] = member;

  return firebase.database().ref().update(memberUpdates);
}

var signOut = function() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    remove
    window.location.href='/logout.html';
  }, function(error) {
    // An error happened.
    console.log('Error:',error);
  });
}

var facebookSignOut = function() {
  FirebaseAuth.getInstance().signOut();    
}

// Roster
var displayRoster = function() {
  var membersQuery = firebase.database().ref("members");

  membersQuery.once("value")
    .then(function(members) {
      var membersHtml = '';
      members.forEach(function(snapshot) {
        var member = snapshot.val();
        membersHtml+= '<tr data-key="'+ member.id +'">';
        membersHtml+= '<td>'+ member.name +'</td>';
        membersHtml+= '<td>'+ member.hometown.name +'</td>';
        membersHtml+= '<td>'+ member.location.name +'</td>';
        membersHtml+= '<td>'+ member.birthday +'</td>';
        membersHtml+= '<td>'+ member.work[0].position.name +'</td>';
        membersHtml+= '</tr>';
      })
      $('#members-table tbody').html(membersHtml);
    });

}
