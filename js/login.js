
 
var fbLoginSuccess = function (userData) 
{
    alert("UserInfo: " + JSON.stringify(userData));
}

function onDeviceReady() {
	FB.init({
	    appId      : '1055846634485484',
	    status     : true,
	    xfbml      : true,
	    version    : 'v2.4' // or v2.0, v2.1, v2.2, v2.3
	});
	$(".fb-login").on('click', function(){
		facebookConnectPlugin.login(["public_profile"],
		    fbLoginSuccess,
		    function (error) { alert("" + error) }
		);
	});
	
}




