(function (root,factory,plug) {
    factory.call(root,root.jQuery,plug);
})(window,function ($,plug) {
    var __DEFAULT__ = {
        duration:300,//切换动画持续的时间
        showTime:2000,
        imageWidth:500,
        scale:parseFloat(parseFloat(16/9).toFixed(2)),
        effect:"sliderVertical",//图片切换效果:slideHorizontal,sliderVertical
        autoSwitch:false,//自动切换
        events:{
            beforeSwitch:null,
            afterSwitch:null
        }
    };

    var __DOTS_TPL__ = {
        STYLE1:'<span class="my-carousel-dots _DOTS_CLASS_NAME_"></span>',
    };
    var __PROTO__ = {
        _init:function () {
            this._parameterCalculate();
            this._uiRender();
            this._bindEvent();
        },
        className:{
            mainContainer:"my-carousel",
            //wrapper
            outerWrapper:"my-carousel-wrapper-outer",
            innerWrapper:"my-carousel-wrapper-inner",

            //dots
            dotsContainerHorizontal:"my-carousel-dots-horizontal",
            dotsContainer:"my-carousel-dots-container",
            dotsBtn:"my-carousel-dots-btn",
            dotsBtnPre:"my-carousel-dots-btn-pre",
            dotsBtnNext:"my-carousel-dots-btn-next",

            //description
            desContainer:"my-carousel-des-container",
        },
        INTERVAL:null,//自动轮播的定时器,
        TIMEOUT:null,
        _getInnerWrapper:function () {
            return $($(this).find("div."+this.className.innerWrapper));
        },
        _getOuterWrapper:function () {
            return $($(this).find("div."+this.className.outerWrapper));
        },
        _parameterCalculate:function () {
            this.ImageHeight = parseFloat(this.imageWidth / this.scale).toFixed(2);
            this.ImageCount = $(this).find("img").length;
            this.isSwitching = false;
        },
        _uiRender:function () {
            //设置外层wrapper样式
            $(this).addClass(this.className.mainContainer).width(this.imageWidth);

            //增加wrapper
            var html = '<div class="'+this.className.outerWrapper+ '" style="width:'+this.imageWidth+'px;height:'+this.ImageHeight+'px;">';
                html += '<div class="'+this.className.innerWrapper+'" data-index="0">';
                    html += $(this).html() + '<div class="clr"></div>';
                html += '</div>';//end of innerWrapper
            html += '</div>';//end of outerWrapper
            $(this).html(html);
            var $innerWrapper = this._getInnerWrapper();

            switch(this.effect){
                case "slideHorizontal":
                    $innerWrapper.width(this.ImageCount * this.imageWidth);
                    break;
                case "sliderVertical":
                    $innerWrapper.height(this.ImageCount * this.ImageHeight);
                    break;
            }

            //添加dots
            var activeIndex = this._getCurrentIndex();
            var dotsHtml = '<div class="'+this.className.dotsContainerHorizontal+'">';
            dotsHtml += '<div class="'+this.className.dotsBtn+' '+this.className.dotsBtnPre+'"><span><i class="fa fa-angle-left"></i></span></div>';
            dotsHtml += '<div class="'+this.className.dotsContainer+'">';
            for(var i=0;i<this.ImageCount;i++){
                var className = i == activeIndex ? "active":"";
                dotsHtml += __DOTS_TPL__.STYLE1.replace("_DOTS_CLASS_NAME_",className);
            }
            dotsHtml += '</div>';
            dotsHtml += '<div class="'+this.className.dotsBtn+' '+this.className.dotsBtnNext+'"><span><i class="fa fa-angle-right"></i></span></div>';
            dotsHtml += '<div class="clr"></div>';
            dotsHtml+='</div>';
            $(this).append(dotsHtml);

            //添加description
            var desHtml = '<div class="'+this.className.desContainer+'">';
            desHtml+='<p></p>';
            desHtml+='</div>';
            $(this).append(desHtml);
            this._renderCurrentDesText();
            this._showDesText(activeIndex);

            //设置图片的宽度
            $(this).find("img").width(this.imageWidth);
        },
        _bindEvent:function () {
            var _this = this;
            $(this).find("div.my-carousel-dots-btn i").on("click",function () {
                if($(this).hasClass("fa-angle-left")){
                    _this._switchToPre();
                }else{
                    _this._switchToNext();
                }
            });

            $(this).find("span.my-carousel-dots").on("click",function () {
                _this._switchTo($(this).index());
            });
        },
        _getCurrentIndex:function () {
            var index = parseInt($(this).find("div."+this.className.innerWrapper).attr("data-index"));
            if(!isNaN(index)){
                return index;
            }else{
                return -1;
            }
        },
        //切换图片
        _switchTo:function (newIndex) {
            var currentIndex = this._getCurrentIndex();
            var newIndex = parseInt(newIndex);
            if(currentIndex != newIndex && !this.isSwitching){
                if(newIndex >= this.ImageCount) newIndex = 0;
                if(newIndex < 0) newIndex = this.ImageCount-1;
                this._switchImgWithAnimate(currentIndex,newIndex);
                this._switchDots(currentIndex,newIndex);
                this._renderCurrentDesText();
                this._showDesText();
            }
        },
        //根据效果切换图片
        _switchImgWithAnimate:function (oldIndex,newIndex) {
            this._stopAutoSwitch();
            this.isSwitching = true;
            var _this = this;
            if(typeof(this.events.beforeSwitch) == "function"){
                this.events.beforeSwitch.call({oldIndex:oldIndex,newIndex:newIndex});
            }
            switch(this.effect){
                case "slideHorizontal":
                    var dis = (oldIndex-newIndex)*this.imageWidth;
                    var $wrapper = this._getInnerWrapper();
                    $wrapper.animate({marginLeft:"+="+dis+"px"},this.duration,function () {
                        _this.isSwitching = false;
                    }).attr("data-index",newIndex);
                    break;
                case "sliderVertical":
                    var dis = (oldIndex-newIndex)*this.ImageHeight;
                    var $wrapper = this._getInnerWrapper();
                    $wrapper.animate({marginTop:"+="+dis+"px"},this.duration,function () {
                        _this.isSwitching = false;
                    }).attr("data-index",newIndex);
                    break;
                default:
                    break;
            }
            if(this.autoSwitch) {
                this._bindAutoSwitch();
            }
            if(typeof(this.events.afterSwitch) == "function"){
                this.events.afterSwitch.call({oldIndex:oldIndex,newIndex:newIndex});
            }
        },
        _switchToNext:function () {
            this._switchTo(this._getCurrentIndex()+1);
        },
        _switchToPre:function () {
            this._switchTo(this._getCurrentIndex()-1);
        },
        //切换dots
        _switchDots:function (oldIndex,newIndex) {
            $($(this).find("span.my-carousel-dots")[newIndex]).addClass("active").siblings(".active").removeClass("active");
        },
        //绑定自动切换
        _bindAutoSwitch:function () {
            var _this = this;
            this.INTERVAL = setInterval(function () {
                _this._switchToNext();
            },_this.showTime)
        },
        _stopAutoSwitch:function () {
            clearInterval(this.INTERVAL);
        },
        //文字描述显示
        _getImgDesText:function(index){
            var activeIndex = this._getCurrentIndex();
            var text = $($(this).find("img")[activeIndex]).data("text");
            if(text) {
                return text.trim();
            }else{
                return "";
            }
        },
        _renderCurrentDesText:function () {
            var text = this._getImgDesText();
            var html = '';
            for(var i = 0; i < text.length;i++){
                html += '<span>'+text[i]+'</span>';
            }
            $($(this).find("div."+this.className.desContainer+">p")).html(html);
        },
        _showDesText:function () {
            var textLetterTime = 80;
            var $spans = $(this).find("div.my-carousel-des-container >p >span");
            var _i = 0;
            for(var i=0;i<$spans.length;i++){
                (function (i) {
                    setTimeout(function () {
                        $($spans[i]).fadeIn();
                    },textLetterTime*i);
                })(i);
            }
        },

        //还原
        _revert:function () {
            var $imgs = $(this).find("div."+this.className.innerWrapper).find("img");
            var imgsHtml = "";
            for(var i = 0;i<$imgs.length;i++){
                var $curImg = $($imgs[i]);
                imgsHtml += '<img src="'+$curImg.attr("src")+'" data-text="'+$curImg.data("text")+'">'
            }
            $(this).html(imgsHtml);
            this._stopAutoSwitch();
        }
    };

    $.fn[plug] = function (options) {
        $.extend(this,__DEFAULT__,__PROTO__,options);
        this._init();
        if(this.autoSwitch){
            this._bindAutoSwitch();
        }
        window.myCarousel = this;
    }
},"myCarousel");