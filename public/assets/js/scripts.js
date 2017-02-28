var user = {
  currentUser: null,
  update() {
    var member = user;
    var memberKey = firebase.database().ref().child('members').push().key;
    var memberUpdates = {};
    memberUpdates['/members/'+user.id] = member;

    return firebase.database().ref().update(memberUpdates);
  }, 
  getPicture (id,token) {
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
  },
  displayInfo(user) {
    $('#email').text(user.email);
    $('#fullName').text(user.name);
    $('#birthdate').text(user.birthday);
    $('#hometown').text(user.hometown.name);
    $('#location').text(user.location.name);
    $('#about').text(user.about);    
  },
  getWorkInfo(work_info) {
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
  },
  getEducationInfo(education_info) {
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
  },
  isAlumni(education) {
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
  },
  setCookie(user) {
    setCookie('userId',user.id);
    setCookie('userFirstName',user.first_name);
  },
  signOut() {
    firebase.auth().signOut().then(function() {
      console.log('Successfully Signed out!')
    },function(error) {
      console.log('Error:', error);
    });
  }
}


var checkAuth = function() {
  var auth = firebase.auth();

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) { // User is signed in.
      var user = JSON.parse(JSON.stringify(user)),
        accessToken = user.stsTokenManager.accessToken;

      var path = window.location.pathname;

      var isProfilePage = /^(\/profile)+(\/|\.html)*$/.test(path),
        isMemberPage = /^(\/member)+(\/)+[A-Za-z0-9_-]+$/.test(path),
        isMembersPage = /^(\/members)+(\/|\.html)*$/.test(path),
        isAccountsPage = /^(\/accounts)+(\/|\.html)*$/.test(path);

      if (isProfilePage) {
        console.log('Profile Page');
        page.profile();
      } else if (isAccountsPage) {
        console.log('Accounts Page');
        page.accounts();
      } else if (isMembersPage) {
        console.log('Members Page');
        page.roster();
      } else if (isMemberPage) {
        console.log('Member Page');
        page.members();
      }

    } else { // User not signed in.
      console.log('No user signed in.');
      window.location.href='/';
    }
  });
};

var payment = {
  set(page) {
    var memberId = getCookie('memberId'),
      userId = getCookie('userId'),
      payment = $('#payment').val();

    $('#paidBy').val(userId);
    if (page=='profile') {
      $('#paidFor').val(userId);
    } else {
      $('#paidFor').val(memberId);
    }
  }
}

var page = {
  profile() {
    var access_token = getCookie('token');
      params = '?fields=id,name,photos,first_name,last_name,email,birthday,hometown,location,about,education,work,picture';
      params+= '&access_token=' + access_token,
      userId = getCookie('userId');

    user.currentUser = firebase.auth().currentUser;

    this.getNavBar();

    if (userId) {
      var userId = getCookie('userId'); 
      var access_token = getCookie('token');
      var usersQuery = firebase.database().ref("members/"+userId);
      usersQuery.once("value")
        .then(function(snapshot) {
          var userInfo = snapshot.val();
          user.isAlumni(userInfo.education);
          // console.log(userInfo);
          user.getPicture(userInfo.id,access_token);
          user.displayInfo(userInfo);
          user.getWorkInfo(userInfo.work);
          user.getEducationInfo(userInfo.education);
          payment.set('profile');
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
          var userInfo = json_response;
          user.isAlumni(userInfo.education);
          // console.log(json_response);
          user.getPicture(userInfo.id,access_token);
          user.displayInfo(userInfo);
          user.getWorkInfo(userInfo.work);
          user.getEducationInfo(userInfo.education);
          payment.set('profile');

          user.setCookie(userInfo);

          userInfo['uid'] = currentUser.uid;
          user.update(userInfo);
        }).catch(function(response) {
          console.log('Error: ',response);
        });
    }
  },
  roster() {
    user.isAlumni();
    this.getNavBar();

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
  },
  members() {
    user.isAlumni();
    this.getNavBar();
    var path = window.location.pathname;
    var memberId = path.split('/')[2];
    // var memberId = getCookie('memberId');
    var access_token = getCookie('token');
    var membersQuery = firebase.database().ref("members/"+memberId);
    membersQuery.once("value")
      .then(function(snapshot) {
        var member = snapshot.val();
        console.log(member);
        user.getPicture(member.id,access_token);
        user.displayInfo(member);
        user.getWorkInfo(member.work);
        user.getEducationInfo(member.education);
        payment.set('profile');
      });    
  },
  accounts() {
    // Accounts Page
    user.isAlumni();
    this.getNavBar();
  },
  getNavBar() {
    var userId = getCookie('userId');
    var userFirstName = getCookie('userFirstName');
    $('#username').html('Hello, '+ userFirstName +' <span class="caret"></span>');
    $('#facebook-profile').attr('href','https://www.facebook.com/'+userId);
  }
}

