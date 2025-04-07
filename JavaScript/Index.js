//CHATGPT HELPED IN THE DEVELOPMENT OF THIS CODE

function onSignIn(googleUser) {
    console.log('SIGN IN BEGAN');
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    //gets the ID ttoken and sends it to the backend

    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    sendIdTokenToBackend(id_token);
}

function sendIdTokenToBackend(id_token) {
    console.log("SENDING STUFF TO BACKEND");
    fetch(`${config.API_URL}/verify-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: id_token }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Backend response:', data);
    })
    .catch(error => {
        console.error('Error sending ID token to backend:', error);
    });
}