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
    function frienshipRequest(userReceptor) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/friends/' + userReceptor + '/friendship_request',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error sending a request: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error enviando la petición:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        $('#addFriend').hide();
        alert("Petición de amistad enviada con éxito");
        console.log('Response received from API: ', result);
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#addFriendForm').on("submit", handleFriendshipRequest);
    });

    function handleFriendshipRequest(event) {
        var params = new URLSearchParams(window.location.search);
        var email = params.get('u');
        var userReceptor = toUsername(email);

        event.preventDefault();
        
        frienshipRequest(userReceptor);
    }
}(jQuery));
