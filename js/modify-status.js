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
    function modifyStatus(status) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/account/modify_status',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                StatusText: status
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error modificating status: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error modificando el estado:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        console.log('Response received from API: ', result);
        window.location.href = 'profile.html';
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/account/profile',
            headers: {
                Authorization: authToken
            },
            success: function(result) {
                if (result.User.Item.StatusText == 'empty') $('#status_input').val("Estado")
                else $('#status_input').val(result.User.Item.StatusText);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting profile: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error mostrando al usuario:\n' + jqXHR.responseText);
            }
        });

        $('#modifyStatusForm').on("submit", handleModifyStatus);
    });

    function handleModifyStatus(event) {
        var status = $('#status_input').val();

        event.preventDefault();

        modifyStatus(status);
    }
}(jQuery));
