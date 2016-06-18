

function onDeviceReady() {
    /* gps alert
    var onSuccess = function(position) {
    alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    */

    var handle = [
        swipeCardHandler(".panel[index=1]"),
        swipeCardHandler(".panel[index=2]"),
        swipeCardHandler(".panel[index=3]"),
        swipeCardHandler(".panel[index=4]"),
        swipeCardHandler(".panel[index=5]")
    ];


    var settingsVisible = false;
    $('.nav-left-btn').on('click touchstart',function(){
        if(!settingsVisible){
            $("#settings").animate({right: "80px"}, {duration: 500, easing: "easeOutBack", complete: function(){settingsVisible = true;}});
        }
    });
    $('body').on('click touchstart', function(e) {
        if(settingsVisible){
            $("#settings").animate({right: $(document).width()}, {duration: 500, easing: "easeInBack", complete: function(){settingsVisible = false;}});
        }
    });
    $("#settings").on('click touchstart',function(e) {
        e.stopPropagation();
    });

    /* MAIN BUTTON EVENTS */
    $('.main-btn').on('mouseup', function(e){
        var h = parseInt($(".panel[index=5]").attr("handle"));
        if($(this).attr('id') === "hot-btn"){
            handle[h].triggerHot();
        }else{
            handle[h].triggerNot();
        }
    }).on('mousedown', function(e){
        $(this).addClass("active");
    }).on("mouseup", function(e){
        $(this).removeClass("active");
    });

    $(document).on('keydown', function(e){
        console.log(e.which);
        if(e.which === 81){
            console.log('q');
        }
    });
    
}

