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
    function allFriendRequests() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/friends/friend_requests',
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
            var html = '<h2>No hay solicitudes de amistad pendientes</h2>';
            $("#friendship_request_list").append(html);
        }
        else{
            result.Users.Responses.UsersFacebuk.forEach(element => {
                var html = '<li>';
                html += '<img src="' + element.Img + '" class="friend_avatar" height="50" width="50">';
                html += '<a href="/user_requested_profile.html?u=' + element.Email + '" class="link friend_name">' + element.FullName + '</a>';
                html += '<input class="user_email" hidden value="' + element.Email + '">';
                html += '<div class="button_container btn_right">';
                html += '<form class="acceptFriendForm">';
                html += '<input type="submit" class="btn btn_primary acceptFriend" value="Aceptar"/>';
                html += '</form>';
                html += '<form class="rejectFriendForm">';
                html += '<input type="submit" class="btn btn_secondary rejectFriend" value="Rechazar"/>';
                html += '</form>';
                html += '</div>';
                html += '</li>';
                $("#friendship_request_list").append(html);
            });
            $('.acceptFriendForm').on("submit", handleAccept);
            $('.rejectFriendForm').on("submit", handleDecline);
        }
        console.log('Response received from API: ', result);
    }

    function acceptFriend(userEmisor) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/friends/' + userEmisor + '/response_friendship_request',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                Confirmation: true 
            }),
            success: completeAcceptRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting profile: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error mostrando al usuario:\n' + jqXHR.responseText);
            }
        });
    }

    function declineFriend(userEmisor) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/friends/' + userEmisor + '/response_friendship_request',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                Confirmation: false 
            }),
            success: completeDeclineRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting profile: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error mostrando al usuario:\n' + jqXHR.responseText);
            }
        });
    }

    function completeAcceptRequest(result) {
        console.log('Response received from API: ', result);
        alert("Petición de amistad aceptada con éxito");
        window.location.href = '/friend_requests.html'
    }

    function completeDeclineRequest(result) {
        console.log('Response received from API: ', result);
        alert("Petición de amistad rechazada con éxito");
        window.location.href = '/friend_requests.html'
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }
    
    /*
    *  Event Handlers
    */
   
    $(function onDocReady() {
        allFriendRequests();
    });

    function handleAccept(event) {
        var email = $(event.currentTarget).parents('li').find('.user_email').val();
        var username = toUsername(email);
        
        event.preventDefault();

        acceptFriend(username);
    }

    function handleDecline(event) {
        var email = $(event.currentTarget).parents('li').find('.user_email').val();
        var username = toUsername(email);
        
        event.preventDefault();

        declineFriend(username);
    }
}(jQuery));
