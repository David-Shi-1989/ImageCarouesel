/**
 * Created by Administrator on 2016/11/8.
 */
$(function () {
    slider.onload();
})

var slider = {
    data:{
        imgCount:0,
        imgWidth:0,
        imgHeight:0,

        swipeStartX:0,
        swipeStartY:0,

        curIndex:0,
        isHandSwipe:false,
    },
    selector:{
        slider:"#div_slider",
        container:"#div_slider_contaienr",
        imgs:"#div_slider_contaienr img",
        dots:"#div_slider_dots",
        text:"#div_slider_imgText",
        fakeLayer:"#div_slider_fakeLayer",
        fakeLayerSubDiv:"#div_slider_fakeLayer div.fakeLayer-subImg",
    },
    el:{
        $slider:null,$container:null,$imgs:null,$dots:null,$text:null,$fakeLayer:null,$fakeLayerSubDiv:null
    },
    setting:{
        oneImgSwitchDuration:300,
        swipeDistanceToSwitch:0.2,
        switchTime:4000,
        switchTransitionType:"horizontal",//vertical,horizontal,rotate
        isAutoSwitch:false,
        sensitivity:0.5,

        imgScale:(16/9).toFixed(4),

        hasBorder:false,

        sliderSize:{
            width:0,
            height:0,
        },

        blindCount:20,
    },
    handle:{
        intervalImgSwitch:null,
    },
    onload:function () {
        slider.el.$slider = $(slider.selector.slider),slider.el.$container=$(slider.selector.container),
            slider.el.$imgs=$(slider.selector.imgs),slider.el.$dots=$(slider.selector.dots),
            slider.el.$text=$(slider.selector.text),slider.el.$fakeLayer=$(slider.selector.fakeLayer)
            slider.el.$fakeLayerSubDiv = $(slider.selector.fakeLayerSubDiv);
        slider.uiFix.widthFix();
        slider.uiFix.opacitySetting();
        slider.uiFix.dotsAppend();

        slider.bindEvent.touchListener();
        slider.bindEvent.autoSwitch();

        slider.renderImgText();
        slider.uiFix.settingsSet();
    },
    uiFix:{
        widthFix:function () {
            slider.data.imgCount = slider.el.$imgs.length;
            if(slider.setting.sliderSize.width <= 0){
                slider.setting.sliderSize.width = document.body.clientWidth;
            }
            slider.setting.sliderSize.height = parseFloat((slider.setting.sliderSize.width/slider.setting.imgScale).toFixed(2));

            slider.el.$slider.width(slider.setting.sliderSize.width).height(slider.setting.sliderSize.height);
            $container = $(slider.selector.container);

            switch(slider.setting.switchTransitionType){
                case "horizontal":
                    $container.width(slider.data.imgCount * slider.setting.sliderSize.width);
                    $(slider.selector.slider).addClass("css-horizontal");
                    $(slider.selector.imgs).width(slider.setting.sliderSize.width);
                    break;
                case "vertical":
                    $(slider.selector.imgs).width(slider.setting.sliderSize.width);
                    $container.width(slider.setting.sliderSize.width + "px").height($(slider.selector.imgs).height());
                    $(slider.selector.slider).height(slider.setting.sliderSize.height).addClass("css-vertical");
                    break;
                case "rotate":
                    $(slider.selector.slider).addClass("css-rotate");
                    $container.width(slider.setting.sliderSize.width).height(slider.setting.sliderSize.height);
                    $(slider.selector.imgs).width(slider.setting.sliderSize.width);
                    for(var i = slider.data.imgCount-1;i>=0;i--){
                        $(slider.el.$imgs[i]).css("zIndex",slider.data.imgCount - i +1);
                    }
                    break;
            }
        },
        opacitySetting:function () {
            if($("#div_slider_contaienr img")[0]){
                $($("#div_slider_contaienr img")[0]).addClass("active");
            }
        },
        dotsAppend:function () {
            var appendStr = "";
            for(var i = 0;i < slider.data.imgCount;i++){
                var className = i == 0? ' class="active" ': '';
                appendStr += "<span "+className+"></span>";
            }
            appendStr += '<div class="clr"></div>';
            $(slider.selector.dots).html(appendStr);

            switch(slider.setting.switchTransitionType){
                case "horizontal":
                    var width = slider.data.imgCount * 40 - 10;
                    $(slider.selector.dots).width(width).css("left", (slider.setting.sliderSize.width - width) / 2);
                    //$(slider.selector.dots).width(width).css("right", "10px");
                    break;
                case "vertical":
                    var top = (slider.setting.sliderSize.height - (slider.data.imgCount * 30 - 10))/2;
                    $(slider.selector.dots).css("top",top);
                    break;
                case "rotate":

                    break;
            }
        },
        settingsSet:function () {
            if(slider.setting.hasBorder){
                $(slider.selector.slider).addClass("css-hasBorder");
            }
        }
    },
    bindEvent:{
        touchListener:function () {
            $("#div_slider_contaienr").on("touchstart",function (event) {
                event.preventDefault();
                var touch = event.originalEvent.targetTouches[0];
                slider.data.swipeStartX = touch.pageX.toFixed(2),slider.data.swipeStartY = touch.pageY.toFixed(2);
            });
            $("#div_slider_contaienr").on("touchmove",function (event) {
                event.preventDefault();
                var touch = event.originalEvent.targetTouches[0];
                var curX = touch.pageX.toFixed(2),curY = touch.pageY.toFixed(2);

                var disX = curX - slider.data.swipeStartX;
                var disY = curY - slider.data.swipeStartY;
                var ml = (parseFloat(slider.data.curIndex * slider.setting.sliderSize.width * -1 + disX)).toFixed(2);
                var mt = (parseFloat(slider.data.curIndex * slider.setting.sliderSize.height * -1 + disY)).toFixed(2);

                switch(slider.setting.switchTransitionType){
                    case "horizontal":
                        if(ml <= 0 && ml >= slider.data.imgCount * slider.setting.sliderSize.width * -1 && ml >= slider.setting.sliderSize.width * (slider.data.imgCount-1) * -1){
                            var disXAfterSensitivity = (parseFloat(slider.data.curIndex * slider.setting.sliderSize.width * -1 + disX * slider.setting.sensitivity)).toFixed(2);
                            $("#div_slider_contaienr").css("marginLeft",disXAfterSensitivity+"px");
                        }
                        break;
                    case "vertical":
                        if(mt <= 0 && mt >= slider.data.imgCount * slider.setting.sliderSize.height * -1 && mt >= slider.setting.sliderSize.height * (slider.data.imgCount-1) * -1){
                            var disYAfterSensitivity = (parseFloat(slider.data.curIndex * slider.setting.sliderSize.height * -1 + disY * slider.setting.sensitivity)).toFixed(2);
                            $("#div_slider_contaienr").css("marginTop",disYAfterSensitivity+"px");
                        }
                        break;
                    case "rotate":

                        break;
                }
            });
            $("#div_slider_contaienr").on("touchend",function (event) {
                event.preventDefault();
                var disX = slider.getMarginLeft() - slider.setting.sliderSize.width * slider.data.curIndex * -1;
                var disY = slider.getMarginTop() - slider.setting.sliderSize.height * slider.data.curIndex * -1;

                switch(slider.setting.switchTransitionType){
                    case "horizontal":
                        if(Math.abs(disX) >= slider.setting.sliderSize.width * slider.setting.swipeDistanceToSwitch){
                            slider.data.isHandSwipe = true;
                            if(disX < 0){
                                slider.switchSliderToNext();
                            }else{
                                slider.switchSliderToPrevious();
                            }
                        }else{
                            slider.switchSlider(slider.data.curIndex,slider.data.curIndex);
                        }
                        break;
                    case "vertical":
                        if(Math.abs(disY) >= slider.setting.sliderSize.height * slider.setting.swipeDistanceToSwitch){
                            slider.data.isHandSwipe = true;
                            if(disY < 0){
                                slider.switchSliderToNext();
                            }else{
                                slider.switchSliderToPrevious();
                            }
                        }else{
                            slider.switchSlider(slider.data.curIndex,slider.data.curIndex);
                        }
                        break;
                    case "rotate":

                        break;
                }
            });
        },
        autoSwitch:function () {
            if(!slider.setting.isAutoSwitch) return;
            slider.handle.intervalImgSwitch = setInterval(function () {
                slider.data.isHandSwipe = false;
                slider.switchSliderToNext();
            },slider.setting.switchTime);
        }
    },
    switchSlider:function (startIndex,endIndex,isHandSwipe) {
        startIndex = parseInt(startIndex),endIndex=parseInt(endIndex);
        if( !slider.isIndexValid(startIndex) || !slider.isIndexValid(endIndex)) return;

        var count = Math.abs(parseInt(startIndex-endIndex));
        var duration = startIndex != endIndex ? slider.setting.oneImgSwitchDuration:slider.setting.oneImgSwitchDuration*0.5;
        var newML = endIndex * slider.setting.sliderSize.width * -1;
        var newMT = endIndex * slider.setting.sliderSize.height * -1;
        if(slider.data.isHandSwipe){
            clearInterval(slider.handle.intervalImgSwitch);
        }
        slider.setActiveImgIndex(endIndex);

        switch(slider.setting.switchTransitionType){
            case "horizontal":
                slider.el.$container.animate({marginLeft:newML},duration,function () {
                    if(slider.data.isHandSwipe && slider.setting.isAutoSwitch){
                        slider.handle.intervalImgSwitch = setInterval(function () {
                            slider.data.isHandSwipe = false;
                            slider.switchSliderToNext();
                        },slider.setting.switchTime);
                    }
                });
                break;
            case "vertical":
                slider.el.$container.animate({marginTop:newMT},duration,function () {
                    if(slider.data.isHandSwipe && slider.setting.isAutoSwitch){
                        slider.handle.intervalImgSwitch = setInterval(function () {
                            slider.data.isHandSwipe = false;
                            slider.switchSliderToNext();
                        },slider.setting.switchTime);
                    }
                });
                break;
            case "rotate":
                slider.renderFakeLayer();
                $(slider.selector.fakeLayerSubDiv).addClass("animate-blind");
                setTimeout(function () {
                    $(slider.selector.fakeLayerSubDiv).hide();
                },3000);
                break;
        }
        slider.renderImgText();
    },
    switchSliderToNext:function () {
        if (slider.data.curIndex < slider.data.imgCount - 1){
            slider.switchSlider(slider.data.curIndex,slider.data.curIndex + 1);
        }else if(slider.data.curIndex == slider.data.imgCount - 1){
            slider.switchSlider(slider.data.imgCount - 1,0);
        }
    },
    switchSliderToPrevious:function () {
        slider.switchSlider(slider.data.curIndex,slider.data.curIndex - 1);
    },

    renderImgText:function () {
        slider.el.$text.html($(slider.el.$imgs[slider.data.curIndex]).data("text"));
        switch(slider.setting.switchTransitionType){
            case "horizontal":
                slider.el.$text.css("right",(slider.el.$text.width()+65)*-1).animate({ right:0  },slider.setting.oneImgSwitchDuration);
                break;
            case "vertical":
                slider.el.$text.css("top",slider.setting.sliderSize.height).animate({ top:slider.setting.sliderSize.height - slider.el.$text.height() - 20  },slider.setting.oneImgSwitchDuration);
                break;
            case "rotate":

                break;
        }
    },

    renderFakeLayer:function () {
        var fakeLayerAppendStr = "";
        var widthPecent = parseFloat((100/slider.setting.blindCount)).toFixed(2);
        for(var i=0;i<slider.setting.blindCount;i++){
            var style = "height:"+slider.setting.sliderSize.height+"px;width:"+widthPecent+"%;";
            style+="background-image:url("+$(slider.el.$imgs[slider.data.curIndex]).attr("src")+");"
            style+="background-size:"+slider.setting.sliderSize.width+"px "+slider.setting.sliderSize.height+"px;";
            style+="background-position:"+(i*widthPecent)+"% 0%;";
            fakeLayerAppendStr += '<div class="fakeLayer-subImg" style="'+style+'"></div>';
        }
        fakeLayerAppendStr += '<div class="clr"></div>';

        slider.el.$fakeLayer.width(slider.setting.sliderSize.width).height(slider.setting.sliderSize.height).append(fakeLayerAppendStr);
        slider.resignZIndex();
        slider.el.$fakeLayer.show();
    },
    resignZIndex:function () {
        var tmp = 2;
        for(var i = slider.data.curIndex;i>=0;i--){
            $(slider.el.$imgs[i]).css("ZIndex",tmp++);
        }
        tmp = slider.data.curIndex+1;
        for(var i= slider.data.curIndex+1;i<slider.data.curIndex;i++){
            $(slider.el.$imgs[i]).css("ZIndex",tmp--);
        }
    },

    getMarginLeft:function () {
        return parseFloat($(this.selector.container).css("marginLeft")).toFixed(2);
    },
    getMarginTop:function () {
        return parseFloat($(this.selector.container).css("marginTop")).toFixed(2);
    },
    setActiveImgIndex:function (index) {
        if(slider.isIndexValid(index)){
            slider.data.curIndex = parseInt(index);
            $("#div_slider_contaienr img").removeClass("active");
            if($("#div_slider_contaienr img")[index]){
                $($("#div_slider_contaienr img")[index]).addClass("active");
            }

            $("#div_slider_dots span").removeClass("active");
            if($("#div_slider_dots span")[index]){
                $($("#div_slider_dots span")[index]).addClass("active");
            }
        }
    },
    isIndexValid:function (index) {
        if(typeof(index) == "number"){
            var t = parseInt(index);
            if(t < 0 || t > slider.data.imgCount - 1){
                return false;
            }else {
                return true;
            }
        }else{
            return false;
        }
    }
}