/*global Facebuk _config*/

var Facebuk = window.Facebuk || {};

(function registerScopeWrapper($) {
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
    function deleteFriend(friend) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/friends/delete_friend',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                Friend: friend
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error deleting a friend: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error eliminando al amigo:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        console.log('Response received from API: ', result);
        $('#delete_friend').hide();
        alert("Amigo eliminado con éxito");
        window.location.href = 'friends.html';
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#deleteFriendForm').on("submit", handleDeleteFriend);
    });

    function handleDeleteFriend(event) {
        var params = new URLSearchParams(window.location.search);
        var email = params.get('u');
        var friend = toUsername(email);

        event.preventDefault();
        
        deleteFriend(friend);
    }
}(jQuery));
