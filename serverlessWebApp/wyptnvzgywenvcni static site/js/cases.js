/*global app _config*/

var app = window.app || {};
app.map = app.map || {};

(function caseScopeWrapper($) {
    var authToken;
    app.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });

    $(function onDocReady() {
        $('#upload').click(handleUpload);
        $('#signOut').click(function() {
            app.signOut();
            alert("You have been signed out.");
            window.location = "signin.html";
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handleUpload(event) {
        event.preventDefault();
        var fileData = $('#file').get()[0].files[0];
        handleFile(fileData)
    }

    function handleFile(fileData) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/case',
            headers: {
                Authorization: authToken
            },
            data: fileData.name,
            contentType: 'application/json',
            fileData: fileData,
            success: putFile,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting case: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured:\n' + jqXHR.responseText);
            }
        });
    }

    function putFile(data) {
        $.ajax({
            type: 'PUT',
            url: data.uploadURL,
            contentType: 'application/zip',
            processData: false,
            data: this.fileData,
            success: function() {
                alert('File uploaded');
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting case: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured:\n' + jqXHR.responseText);
            }
        });
    }
}(jQuery));
