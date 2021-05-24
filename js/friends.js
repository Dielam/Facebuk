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
    function friends() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/friends/friends',
            headers: {
                Authorization: authToken
            },
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting friend requests: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error mostrando al usuario:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        if(result.Users == "EMPTY"){
            var html = '<h2>No hay amigos que mostrar</h2>';
            $("#friends_list").append(html);
        }
        else{
            result.Users.Responses.UsersFacebuk.forEach(element => {
                var html = '<li class="friend_item">';
                html += '<img src="' + element.Img + '" class="friend_avatar" height="50" width="50">';
                html += '<a href="/friend_profile.html?u=' + element.Email + '" class="link friend_name">' + element.FullName + '</a>';
                html += '</li>';
                $("#friends_list").append(html);
            });
        }
        console.log('Response received from API: ', result);
    }
    
    /*
    *  Event Handler
    */
   
    $(function onDocReady() {
        friends();
    });

}(jQuery));
