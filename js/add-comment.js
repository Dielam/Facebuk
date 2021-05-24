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
    function addComment(userReceptor, commentText) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/comments/' + userReceptor + '/add_comment',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                Comment: commentText
            }),
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
        var params = new URLSearchParams(window.location.search);
        var email = params.get('u');
        console.log(email);

        alert("Se ha enviado el comentario con éxito");
        console.log('Response received from API: ', result);
        window.location.href = 'https://master.d3saw48ccwrx2t.amplifyapp.com/comments_friend.html?u=' + email
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#addCommentForm').on("submit", handleAddComment);
    });

    function handleAddComment(event) {
        var params = new URLSearchParams(window.location.search);
        var email = params.get('u');
        var userReceptor = toUsername(email);
        var commentText = $('#comment').val();

        event.preventDefault();
        
        addComment(userReceptor, commentText);
    }
}(jQuery));
