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
        case '/member':
        case '/member/':
        case '/member.html':
          displayMember();
          break;
        case '/accounts':
        case '/accounts/':
        case '/accounts.html':
          displayAccounts();
          break;
      }
    } else { // User not signed in.
      console.log('No user signed in.');
      window.location.href='/';
    }
  });
};

var getProfilePicture = function(id,token) {
  var params = 'height=500&width=500&type=large&redirect=true`';
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
};

var displayUserContent = function(user) {
  $('#email').text(user.email);
  $('#fullName').text(user.name);
  $('#birthdate').text(user.birthday);
  $('#hometown').text(user.hometown.name);
  $('#location').text(user.location.name);
  $('#about').text(user.about);
};

var initNavBar = function() {
  var userId = getCookie('userId');
  var userFirstName = getCookie('userFirstName');
  $('#username').html('Hello, '+ userFirstName +' <span class="caret"></span>');
  $('#facebook-profile').attr('href','https://www.facebook.com/'+userId);
};

var displayWorkInfo = function(work_info) {
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
};

var displayEducationInfo = function(education_info) {
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
};

var setUserCookie = function(user) {
  setCookie('userId',user.id);
  setCookie('userFirstName',user.first_name);
};

var isAlumni = function(education) {
  if (education!=null) {
    for(var i=0;i<education.length;i++) {
      var edu = education[i];

      var schools = [111114218932242,108438665853367,108194572546970];

      if (edu.type=='High School' && edu.year.name=='1998' && $.inArray(edu.school.id,schools)) {
        localStorage.setItem('isAlumni','true');
        return true;
      }
    }
  } else { //If no education
    if (localStorage.getItem('isAlumni')=='true') {
      // console.log('Yes, this person is an alumni!');
      return true;
    }
  }

  localStorage.setItem('isAlumni','false');
  window.location.href = '/404.html';
  return false;
};

// CRUD Payments
var setPayment = function(page) {
  var memberId = getCookie('memberId'),
    userId = getCookie('userId'),
    payment = $('#payment').val();

    $('#paidBy').val(userId);
    if (page=='profile') {
      $('#paidFor').val(userId);
    } else {
      $('#paidFor').val(memberId);
    }
};


// CRUD User
var updateUser = function(user) {
  var member = user;
  var memberKey = firebase.database().ref().child('members').push().key;
  var memberUpdates = {};
  memberUpdates['/members/'+user.id] = member;

  return firebase.database().ref().update(memberUpdates);
};


// Profile Page
var displayProfile = function() {
  var access_token = getCookie('token');
    params = '?fields=id,name,photos,first_name,last_name,email,birthday,hometown,location,about,education,work,picture';
    params+= '&access_token=' + access_token,
    userId = getCookie('userId'),
    currentUser = firebase.auth().currentUser;

  initNavBar();

  if (userId) {
    var userId = getCookie('userId'); 
    var access_token = getCookie('token');
    var usersQuery = firebase.database().ref("members/"+userId);
    usersQuery.once("value")
      .then(function(snapshot) {
        var user = snapshot.val();
        isAlumni(user.education);
        console.log(user);
        getProfilePicture(user.id,access_token);
        displayUserContent(user);
        displayWorkInfo(user.work);
        displayEducationInfo(user.education);
        setPayment('profile');
      });
  } else {
    fetch('https://graph.facebook.com/v2.8/me'+params,{
        method: 'GET',
        headers: new Headers(),
        mode: 'cors',
        cache: 'default',
      }).then(function(response) {
        return response.json();
      }).then(function(json_response) {
        var user = json_response;
        isAlumni(user.education);
        // console.log(json_response);
        getProfilePicture(user.id,access_token);
        displayUserContent(user);
        displayWorkInfo(user.work);
        displayEducationInfo(user.education);
        setPayment('profile');

        setUserCookie(user);

        user['uid'] = currentUser.uid;
        updateUser(user);
      }).catch(function(response) {
        console.log('Error: ',response);
      });
  }

};

// Roster Page
var displayRoster = function() {
  isAlumni();
  initNavBar();

  var membersQuery = firebase.database().ref("members");
  membersQuery.once("value")
    .then(function(members) {
      var membersHtml = '';
      members.forEach(function(snapshot) {
        var member = snapshot.val();
        membersHtml+= '<tr data-key="'+ member.id +'" style="cursor:pointer;">';
        membersHtml+= '<td>'+ member.name +'</td>';
        membersHtml+= '<td>'+ member.email +'</td>';
        membersHtml+= '<td>'+ member.hometown.name +'</td>';
        membersHtml+= '<td>'+ member.location.name +'</td>';
        membersHtml+= '<td>'+ member.birthday +'</td>';
        membersHtml+= '<td>'+ member.work[0].position.name +'</td>';
        membersHtml+= '</tr>';
      });
      $('#members-table tbody').html(membersHtml);
    });

  membersQuery.once("value").then(function(snapshot) {
    var membersCount = snapshot.numChildren();
    $('#membersCount').html(membersCount);
  });
};

// Member Page
var displayMember = function() {
  isAlumni();
  initNavBar();

  var memberId = getCookie('memberId');
  var access_token = getCookie('token');
  var membersQuery = firebase.database().ref("members/"+memberId);
  membersQuery.once("value")
    .then(function(snapshot) {
      var member = snapshot.val();
      console.log(member);
      getProfilePicture(member.id,access_token);
      displayUserContent(member);
      displayWorkInfo(member.work);
      displayEducationInfo(member.education);
      setPayment('profile');
    });
};

// Account Page
var displayAccounts = function() {
  isAlumni();
  initNavBar();
};

// Sign Out
var signOut = function() {
  firebase.auth().signOut().then(function() {
    console.log('Successfully Signed out!')
  },function(error) {
    console.log('Error:', error);
  });
};