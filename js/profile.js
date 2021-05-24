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
    function profile() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/account/profile',
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
        $('#data_name').text(result.User.Item.FullName);
        $('#data_age').text(result.User.Item.Birthdate);
        $('#data_gender').text(result.User.Item.Gender);
        if(result.User.Item.StatusText == "empty" || result.User.Item.StatusText == "Estado")
            $('#data_status').text("Modifica tu estado");
        else $('#data_status').text(result.User.Item.StatusText);
        $("img[src='userImage']").first().attr('src', result.User.Item.Img)
        console.log('Response received from API: ', result);
    }
    
    $(function onDocReady() {
        profile();
    });

}(jQuery));
