/*global Facebuk _config*/

var Facebuk = window.Facebuk || {};

(function rideScopeWrapper($) {
    var authToken;
    Facebuk.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/index.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/index.html';
    });
    function userProfile(user) {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/users/' + user + '/profile',
            headers: {
                Authorization: authToken
            },
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting profile: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error mostrando al usuario:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        if(result.User.Item == undefined){
            $("img[src='userImage']").first().attr('src', 'img/avatars/Noprofile.jpg');
            alert("No existe ningún usuario con ese email");
            window.location.href = 'user_search.html';
        }
        if(result.User.FullName == 'CURRENT_USER'){
            window.location.href = 'profile.html';
        }
        if(result.User.UserStatus == 'FRIENDS'){
            window.location.href = 'friend_profile.html?u=' + result.User.Item.Email;
        }
        if(result.User.UserStatus == 'NO_RESULT'){
            window.location.href = 'user_profile.html?u=' + result.User.Item.Email;
        }
        $('#data_name').text(result.User.Item.FullName);
        $('#data_age').text(result.User.Item.Birthdate);
        $('#data_gender').text(result.User.Item.Gender);
        if(result.User.Item.StatusText !== "empty" && result.User.Item.StatusText !== "Estado")
            $('#data_status').text(result.User.Item.StatusText);
        $("img[src='userImage']").first().attr('src', result.User.Item.Img)
        $(".user_email").val(result.User.Item.Email);
        console.log('Response received from API: ', result);
    }
    
    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handler
     */

    $(function onDocReady() {
        var params = new URLSearchParams(window.location.search);
        var email = params.get('u');
        var user = toUsername(email);

        userProfile(user);
    });
}(jQuery));
