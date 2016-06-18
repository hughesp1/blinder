var mouseEventTypes = {
    touchstart : "mousedown",
    touchmove : "mousemove",
    touchend : "mouseup"
};

for (originalType in mouseEventTypes) {
    document.addEventListener(originalType, function(originalEvent) {
        event = document.createEvent("MouseEvents");
        touch = originalEvent.changedTouches[0];
        event.initMouseEvent(mouseEventTypes[originalEvent.type], true, true,
                window, 0, touch.screenX, touch.screenY, touch.clientX,
                touch.clientY, touch.ctrlKey, touch.altKey, touch.shiftKey,
                touch.metaKey, 0, null);
        originalEvent.target.dispatchEvent(event);
    });
}

var swipeAnimationRunning = false;

function onBinActionStart(direction){
    swipeActionRunning = true;
    //code ...
    console.log(direction);
}
function onBinActionComplete(direction){
    swipeActionRunning = false;
    //code ...
    console.log(direction);
}

function swipeCardHandler(sel) {

    // Dragging
    var $d = $(sel);

    $d.append('<div id="hot-wrapper"><div class="banner">HOT</div></div><div id="not-wrapper"><div class="banner">NOT</div></div><div class="escape-focus">&lt;</div>');

    // Initial Positions
    var iY = parseInt($d.css("top"));
    var iX = parseInt($d.css("left"));
    var xPos = iX;
    var yPos = iY;

    var pX = 0;
    var pY = 0;

    var vX = 0;
    var vY = 0;

    var date = new Date();
    var time = date.getTime();
    var period = 0;
    var velocity = 0;

    var docWidth = $(document).width();

    var opacityUpperThreshold = 0.85;
    var opacityThreshold = 0.75;
    var binDist = 1000;
    var bins = [
        {sel: "#not-wrapper .banner", top: parseInt(iY), left: parseInt(iX) - binDist, opacity: 0, ang: 270},
        {sel: "#hot-wrapper .banner", top: parseInt(iY), left: parseInt(iX) + binDist, opacity: 0, ang: 90}
    ];


    var rotateFunc = function(){
        return sigmoid((iX - xPos) / (docWidth/2)) * 20;
    }



    function updateTimers(){
        date = new Date();
        var prevTime = time;
        time = date.getTime();
        period = time - prevTime;
        var nX = parseInt($d.css("left"));
        var nY = parseInt($d.css("top"));
        pX = nX - xPos;
        pY = nY - yPos;
        xPos = nX;
        yPos = nY;
        vX = pX/period;
        vY = pY/period;
        velocity = Math.sqrt(Math.pow(vX, 2) + Math.pow(vY, 2));
    }

    function direction(x, y){
        y = -y;
        var theta = Math.atan2(x, y);// * 180 / Math.PI;
        if (theta < 0){
           theta += 2 * Math.PI;
        }
        return theta * 180 / Math.PI;
    }

    function acceptedAngle(x, y, range){
        for(var i=0; i<bins.length; i++){
            var dir = direction(x, y);
            dir = dir > 360-range ? dir - 360 : dir;
            if(Math.abs(dir - bins[i].ang) < range){
                return i;
            }
        }
    }

    function returnCard(dir){

        $('.panel[index="5"]').draggable('disable');
        $('.panel[index="4"]').draggable('enable');
        for(var i=5; i>0; i--){
            $(".panel[index=" + String(i) + "]").attr("index", String(i + 1));
        }
        $(".panel[index=6]").attr("index", "1");

        for(var i=1; i<6; i++){
            $(".panel[index=" + String(i) + "]").css("z-index", 100 + i);
        }

        $d.find(".banner").css("opacity", "0");
        $d.css({'transform' : 'rotate(0deg)'});
        $d.css({top: iY, left: iX});
        onBinActionComplete(dir);
        swipeAnimationRunning = false;
    }

    function sigmoid(t){
        return (1 - Math.exp(-t))/(1 + Math.exp(-t));
    }

    function panelSpringAnimate(){
        var maxOp = Math.min(Math.max(bins[0].opacity, bins[1].opacity), 1.0);
        var rot = rotateFunc();
        $(".panel").each(function(){
            var i = parseInt($(this).attr("index"));
            var interpol = (i === 1 ? 1 : maxOp);
            var interpol = (i === 5 ? 0 : interpol);
            var bY = ((5 - i) * 7) - (interpol * 7);
            var bS = 1.0 - ((5 - i) * 0.02) + (interpol * 0.02);
            var r = (i === 5 ? rot : 0);
            $(this).css({
                "transform":"translate(0px," + String(bY) + "px) scale(" + String(bS) + ", " + String(bS) + ") rotate(" + String(r) + "deg)",
            });
        });
    }

    function binFade(top, left){
        //calculate tentative opacities
        for(var i=0; i<bins.length; i++){
            var dist = Math.sqrt(Math.pow(top - bins[i].top, 2) + Math.pow(left - bins[i].left, 2));
            bins[i].opacity = sigmoid((binDist - dist)/40);
            $d.find(bins[i].sel).css("opacity", bins[i].opacity);
        }
        panelSpringAnimate();
    }

    function binAnimate(props){
        props.duration = (typeof props.duration === "undefined" ? 250 : props.duration);
        $d.animate({top:props.top, left:props.left}, {
            duration: props.duration,
            step: function(){
                xPos = parseInt($(this).css("left"));
                yPos = parseInt($(this).css("top"));
                binFade(yPos, xPos);
            },
            easing: "easeInSine",
            complete: function(){
                returnCard(props.bin);
            }
        });
    }
    
    function triggerHot(){
        if(swipeAnimationRunning){return false;}
        rotateFunc = function(){
            return sigmoid((xPos - iX) / (docWidth/2)) * 20;
        }
        swipeAnimationRunning = true;
        maxOpacityIndex = 1;
        onBinActionStart(1);
        binAnimate({top: 0, left: 1000, bin: maxOpacityIndex, duration: 500});
    }
    function triggerNot(){
        if(swipeAnimationRunning){return false;}
        rotateFunc = function(){
            return sigmoid((xPos - iX) / (docWidth/2)) * 20;
        }
        swipeAnimationRunning = true;
        maxOpacityIndex = 0;
        onBinActionStart(0);
        binAnimate({top: 0, left: -1000, bin: maxOpacityIndex, duration: 500});
    }

    $d.draggable({
        start: function(e, ui) {
            //determine if the card should pivot on the top or the bottom
            //cardClickPosY > cardHeight ?
            $d.stop();//if an animation is running it is stopped
            if((e.pageY - $(this).offset().top) > ($(this).outerHeight()/2)){
                //bottom rotate
                rotateFunc = function(){
                    return sigmoid((iX - xPos) / (docWidth/2)) * 20;
                }
            }else{
                //top rotate
                rotateFunc = function(){
                    return sigmoid((xPos - iX) / (docWidth/2)) * 20;
                }
            }
            updateTimers();
        },
        drag: function(){
            updateTimers();
            binFade(yPos, xPos);
        },
        stop: function(e, ui) {
            $d.stop();

            var maxOpacity = 0;
            var maxOpacityIndex = 0;
            for(var i=0; i<bins.length; i++){
                if(bins[i].opacity > maxOpacity){
                    maxOpacity = bins[i].opacity;
                    maxOpacityIndex = i;
                }
            }
            var minDiff = 20;
            for(var i=0; i<bins.length; i++){
                if(i !== maxOpacityIndex){
                    var diff = maxOpacity - bins[i].opacity;
                    if(diff<minDiff){
                        minDiff = diff;
                    }
                }
            }
            
            var acceptedAng = acceptedAngle(pX, pY, 18);
            var agreeingAng = String(acceptedAng)!=="undefined" && acceptedAng == maxOpacityIndex;

            if(agreeingAng && (maxOpacity > opacityThreshold || velocity > 0.5)){
                onBinActionStart(acceptedAng);
                var pNorm = Math.sqrt(Math.pow(pX, 2) + Math.pow(pY, 2));
                binAnimate({top: 1000 * (pY/pNorm), left: 1000 * (pX/pNorm), bin: acceptedAng});

            }else if(maxOpacity > opacityUpperThreshold){
                onBinActionStart(maxOpacityIndex);
                var props = {top: 0, left: 0, bin: maxOpacityIndex};
                switch(maxOpacityIndex) {
                    case 0:
                        props.left = -1000;
                        break;
                    case 1:
                        props.left = 1000;
                        break;
                }
                binAnimate(props);
            }else{
                //$d.draggable('disable');

                var maxOpacity = Math.max(bins[0].opacity, bins[1].opacity);
                for(var i=0; i< bins.length; i++){
                    $d.find(bins[i].sel).animate({opacity: 0}, {duration:300, step:function(now){
                        bins[0].opacity = (now === 0 ? bins[0].opacity : now);
                        bins[1].opacity = (now === 0 ? bins[1].opacity : now);
                    }});
                }
                $d.animate({top: iY, left: iX}, {duration:500, step:function(){
                    xPos = parseInt($d.css("left"));
                    yPos = parseInt($d.css("top"));
                    panelSpringAnimate();
                }, easing:"easeOutBack",
                complete: function(){
                    //$d.draggable('enable');
                    console.log("complete");
                }
            });
            }
        }
    });
    if($d.attr("index") !== "5"){
        $d.draggable('disable');
    }

    var panelFocused = false;
    $d.on('click', function(e){
        if($d.attr('index') === "5" && !panelFocused){
            $d.draggable("disable");
            $d.animate({top: "-40px", width: "102%", height: $(window).height(), left: "-3px"}, 500, "easeInOutQuint");
            $d.find(".panel-img").animate({bottom: "210px"}, 500, "easeInOutQuint");
            $d.find(".panel-footer").animate({height: "210px"}, 500, "easeInOutQuint");
            $d.find(".escape-focus").fadeIn(200);
            //e.stopImmediatePropagation();
            panelFocused = true;
        }
    });

    $d.find(".escape-focus").on("click", function(e){
        if($d.attr('index') === "5" && panelFocused){
            $d.draggable("enable");
            $d.animate({top: "5px", width: $("#swipe-container").outerWidth() - 10, height: $("#swipe-container").outerHeight() - 15, left: "5px"}, 500, "easeInOutQuint");
            $d.find(".panel-img").animate({bottom: "53px"}, 500, "easeInOutQuint");
            $d.find(".panel-footer").animate({height: "54px"}, 500, "easeInOutQuint");
            $d.find(".escape-focus").fadeOut(200);
            e.stopImmediatePropagation();
            panelFocused = false;
        }
    });


    return {
        triggerHot: triggerHot,
        triggerNot: triggerNot,
        disable: function(){$d.draggable("disable")},
        enable: function(){$d.draggable("enable")}
    };





}
