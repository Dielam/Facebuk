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
    function modifyProfile(name, gender, birthdate, img) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/account/modify_profile',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                Data: {
                    FullName: name,
                    Birthdate: birthdate,
                    Gender: gender,
                    Img: img
                }
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error modificating profile: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error modificando el perfil de usuario:\n' + jqXHR.responseText);
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
            success: function (result){
                $('#name_input').val(result.User.Item.FullName);
                $('#date_input').val(result.User.Item.Birthdate);

                if (result.User.Item.Gender == 'Masculino')
                    $('#gender_input--male').prop('checked', true);
                else if (result.User.Item.Gender == 'Femenino')
                    $('#gender_input--female').prop('checked', true);
                else
                    $('#gender_input--other').prop('checked', true);
                
                if (result.User.Item.Img == 'img/avatars/Luffy.jpg')
                    $('#avatar_1').prop('checked', true);
                else if (result.User.Item.Img == 'img/avatars/Ace.png')
                    $('#avatar_2').prop('checked', true);
                else if (result.User.Item.Img == 'img/avatars/Sabo.jpg')
                    $('#avatar_3').prop('checked', true);
                else if (result.User.Item.Img == 'img/avatars/Nami.jpg')
                    $('#avatar_4').prop('checked', true);
                else if (result.User.Item.Img == 'img/avatars/NicoRobin.jpg')
                    $('#avatar_5').prop('checked', true);
                else if (result.User.Item.Img == 'img/avatars/Noprofile.jpg')
                    $('#avatar_8').prop('checked', true);
                else if (result.User.Item.Img == 'img/avatars/emporio-ivankov-5456.jpg')
                    $('#avatar_7').prop('checked', true);
                else
                    $('#avatar_6').prop('checked', true);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting profile: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error mostrando al usuario:\n' + jqXHR.responseText);
            }
        });

        $('#modifyProfileForm').on("submit", handleModifyProfile);
    });

    function handleModifyProfile(event) {
        var name = $('#name_input').val();
        var birthdate = $('#date_input').val();
        var gender = $("input[name='gender']:checked").val();
        var img = $("input[name='avatar']:checked").val();

        event.preventDefault();

        modifyProfile(name, gender, birthdate, img);
    }
}(jQuery));
