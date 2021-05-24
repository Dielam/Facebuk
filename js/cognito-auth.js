/*global Facebuk _config AmazonCognitoIdentity AWSCognito*/

var Facebuk = window.Facebuk || {};

(function scopeWrapper($) {
    var signinUrl = '/index.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    Facebuk.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    Facebuk.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(username, email, password, name, birthdate, gender, img, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };

        var attributeList = [];
        attributeList.push(dataEmail);

        userPool.signUp(username, password, attributeList, null,
            function signUpCallback(err) {
                if (!err) {
                    $.ajax({
                        method: 'POST',
                        url: _config.api.invokeUrl + '/register',
                        data: JSON.stringify({
                            User: {
                                Username: username,
                                Email: email,
                                Password: password,
                                FullName: name,
                                Birthdate: birthdate,
                                Gender: gender,
                                Img: img
                            }
                        }),
                        contentType: 'application/json',
                        success: onSuccess,
                        error: function ajaxError(jqXHR, textStatus, errorThrown) {
                            console.error('Error registering: ', textStatus, ', Details: ', errorThrown);
                            console.error('Response: ', jqXHR.responseText);
                            alert('Ha ocurrido un error:\n' + jqXHR.responseText);
                        }
                    });
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Email: toUsername(email),
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function signout(onSuccess, onFailure) {
        var cognitoUser = userPool.getCurrentUser();
        
        if(cognitoUser !== null){
            try{
                cognitoUser.signOut();
                onSuccess();
            } catch(err){
                onFailure(err);
            }
        }
        else alert("Usuario nulo");
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            Pool: userPool
        });
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#logout').click(handleSignout);
    });

    function handleSignin(event) {
        var email = $('#email_input').val();
        var password = $('#password_input').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'profile.html';
            },
            function signinError(err) {
                alert(err.message);
                if(err.message == "El usuario no está verificado.") window.location.href = 'verify.html';
            }
        );
    }

    function handleRegister(event) {
        var email = $('#email_input').val();
        var password = $('#password_input').val();
        var password2 = $('#password_input2').val();
        var name = $('#name_input').val();
        var birthdate = $('#date_input').val();
        var gender = $("input[name='gender']:checked").val();
        var img = $("input[name='avatar']:checked").val();
        var username = toUsername(email);

        var onSuccess = function registerSuccess(result) {
            console.log('user name is ' + result.User);
            var confirmation = ('Registro completo. Comprueba la bandeja de entrada de tu email para el código de verificación.');
            if (confirmation) {
                alert(confirmation);
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(username, email, password, name, birthdate, gender, img, onSuccess, onFailure);
        } else {
            alert('Las contraseñas no coinciden');
        }
    }

    function handleSignout(event) {
        signout(function signoutSuccess() {
                console.log('Successfully Logout');
                alert("Has cerrado tu sesión");
                window.location.href = signinUrl;
            },
            function signoutError(err) {
                alert(err.message);
                if(err.message == "Error cerrando la sesión") alert(err.message);
            }
        );
    }

    function handleVerify(event) {
        var email = $('#email_input').val();
        var code = $('#code_input').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verificación completada. Siendo redirigido para iniciar sesión.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
}(jQuery));
