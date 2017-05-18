(function (root,factory,plug) {
    factory.call(root,root.jQuery,plug);
})(window,function ($,plug) {
    var __DEFAULT__ = {
        switchDuration:200,//切换动画持续的时间
        duration:2000,
        width:500,
        scale:parseFloat(parseFloat(16/9).toFixed(2)),
        effect:"slideHorizontal",//图片切换效果
        autoSwitch:true,//自动切换
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
            this.HEIGHT = parseFloat(this.width / this.scale).toFixed(2);
            this.SIZE = $(this).find("img").length;
        },
        _uiRender:function () {
            //设置外层wrapper样式
            $(this).addClass(this.className.mainContainer).css("width",this.width);

            //增加wrapper
            var html = '<div class="'+this.className.outerWrapper+ '" style="width:'+this.width+'px;">';
                html += '<div class="'+this.className.innerWrapper+'" data-index="0">';
                    html += $(this).html() + '<div class="clr"></div>';
                html += '</div>';//end of innerWrapper
            html += '</div>';//end of outerWrapper
            $(this).html(html);
            var $innerWrapper = this._getInnerWrapper();
            $innerWrapper.width(this.SIZE * this.width);

            //添加dots
            var activeIndex = this._getCurrentIndex();
            var dotsHtml = '<div class="'+this.className.dotsContainerHorizontal+'">';
            dotsHtml += '<div class="'+this.className.dotsBtn+' '+this.className.dotsBtnPre+'"><span><i class="fa fa-angle-left"></i></span></div>';
            dotsHtml += '<div class="'+this.className.dotsContainer+'">';
            for(var i=0;i<this.SIZE;i++){
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
            $(this).find("img").width(this.width);
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
            if(currentIndex != newIndex){
                if(newIndex >= this.SIZE) newIndex = 0;
                if(newIndex < 0) newIndex = this.SIZE-1;
                this._switchImgWithAnimate(currentIndex,newIndex);
                this._switchDots(currentIndex,newIndex);
                this._renderCurrentDesText();
                this._showDesText();
            }
        },
        //根据效果切换图片
        _switchImgWithAnimate:function (oldIndex,newIndex) {
            this._stopAutoSwitch();
            switch(this.effect){
                case "slideHorizontal":
                    var dis = (oldIndex-newIndex)*this.width;
                    var $wrapper = this._getInnerWrapper();
                    $wrapper.animate({marginLeft:"+="+dis+"px"},this.switchDuration*Math.abs(oldIndex-newIndex)).attr("data-index",newIndex);
                    break;
                default:
                    break;
            }
            if(this.autoSwitch) {
                this._bindAutoSwitch();
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
            },this.duration)
        },
        _stopAutoSwitch:function () {
            clearInterval(this.INTERVAL);
        },
        //文字描述显示
        _getImgDesText:function(index){
            var activeIndex = this._getCurrentIndex();
            var text = $($(this).find("img")[activeIndex]).data("text");
            return text.trim();
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
        }
    };

    $.fn[plug] = function (options) {
        $.extend(this,__DEFAULT__,__PROTO__,options);
        this._init();
        if(this.autoSwitch){
            this._bindAutoSwitch();
        }
    }
},"myCarousel");