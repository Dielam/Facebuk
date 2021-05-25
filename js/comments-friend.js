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
    function comments(userReceptor) {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/comments/' + userReceptor + '/comments_friend',
            headers: {
                Authorization: authToken
            },
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting comments: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Ha ocurrido un error mostrando los comentarios del usuario:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        var params = new URLSearchParams(window.location.search);
        var email = params.get('u');
        var link = '<a href="/add_comment.html?u=' + email + '" class="btn btn_menu btn_centered">Añadir comentario</a>';
        $("#add_comment").append(link);

        if(result.Users == "EMPTY"){
            var html = '<h2>No hay comentarios para mostrar</h2>';
            $("#comment_list").append(html);
        }
        else{
            result.Users.forEach(element => {
                element.commentText.forEach(comment => {
                    var html = '<li class="comment_item">';
                    html += '<img src="' + element.dataUser.Img + '" class="friend_avatar" height="50" width="50">';
                    html += '<div class="comment-container">';
                    html += '<a href="/friend_profile.html?u=' + element.dataUser.Email + '" class="link friend_name">' + element.dataUser.FullName + '</a>';
                    html += '<input class="user_email" hidden value="' + element.dataUser.Email + '">';
                    html += '<div class="comment">';
                    html += '<p class="comment_text">'+ comment +'</p>';
                    html += '</div>';
                    html += '</div>';
                    html += '</li>';
                    $("#comment_list").append(html);
                });
            });
        }
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
        var userReceptor = toUsername(email);

        comments(userReceptor);
    });

}(jQuery));
