$(document).ready(function(){
  $("#loginForm").on('submit', function(){
    var user = $('#id');
    var password = $('#password');
    var users = {id:id.val(), password:password.val()};
    console.log('button clicked');
    $.ajax({
      type: 'POST',
      url: '/login',
      data: users,
      success: function (data) {
        location.reload();
      }
    });
  });
});
