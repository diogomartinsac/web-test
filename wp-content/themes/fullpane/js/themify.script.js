// Themify Theme Scripts - https://themify.me/

// Initialize object literals
var AutoColumnClass = {}, Themify_Carousel_Tools = {}, themifyScript, tbLocalScript;

/////////////////////////////////////////////
// jQuery functions
/////////////////////////////////////////////
(function ($) {
	// Test if this is a touch device /////////
	function is_touch_device() {
		return Themify.body[0].classList.contains('touch');
	}

    $(document).ready(function () {
        var $sections = $('.type-section'),
                usesRows = !$sections.length,
                isFullPageScroll = !Themify.is_builder_active  && themifyScript.fullPageScroll && Themify.body[0].classList.contains('full-section-scrolling'),
                is_horizontal_scrolling = isFullPageScroll && Themify.body[0].classList.contains('full-section-scrolling-horizontal'),
                sectionClass = '.section-post:not(.section-post-slide)',
                slideClass = '.module_row_slide',
                sectionsWrapper = 'div:not(.module-layout-part) > #loops-wrapper',
                wowInit2,
                first_load_counter = 1,
                first_slide_counter = 1;


// Setup variables if it uses Builder rows instead of section post type
        if (usesRows) {
            isFullPageScroll = isFullPageScroll && $('.themify_builder').length > 0;
            sectionClass = '.module_row:not('+slideClass+')';
            sectionsWrapper = 'div:not(.module-layout-part) > .themify_builder_content:not(.not_editable_builder)';
        }
        isFullPageScroll && updateFullPage();

// Remove non visible rows
        function updateFullPage() {
            var rows = usesRows?$(sectionsWrapper+'>.module_row'):$(sectionsWrapper + ' ' + sectionClass),
                    bp = themifyScript.responsiveBreakpoints || {},
                    winWidth = window.innerWidth,
                    bpRange = {
                        desktop: winWidth >= bp.tablet_landscape,
                        tablet: winWidth < bp.tablet_landscape && winWidth >= bp.mobile,
                        mobile: winWidth <= bp.mobile
                    };

            rows.each(function () {
                var $el = $(this),
                    cl=this.classList;

                if ($el.is(':hidden')) {
                    $el.remove();
                } else if (cl.contains('hide-desktop') || cl.contains('hide-tablet') || cl.contains('hide-mobile')) {
                    for (var key in bpRange) {
                        bpRange[key] === true && cl.contains('hide-'+key) && $el.remove();
                    }
                }
            });
            // Set default row column alignment
            window.top._rowColAlign = 'col_align_middle';
        }

        Themify_Carousel_Tools = {
            intervals: [],
            highlight: function (item) {
                item.addClass('current');
            },
            unhighlight: function ($context) {
                $('li', $context).removeClass('current');
            },
            timer: function ($timer, intervalID, timeout, step) {
                var progress = 0,
                        increment = 0;

                this.resetTimer($timer, intervalID);

                this.intervals[intervalID] = setInterval(function () {
                    progress += step;
                    increment = (progress * 100) / timeout;
                    $timer.css('width', increment + '%');
                }, step);
            },
            resetTimer: function ($timer, intervalID) {
                if (null !== this.intervals[intervalID]) {
                    clearInterval(this.intervals[intervalID]);
                }
                $timer.width('width', '0%');
            },
            getCenter: function ($context) {
                var visible = $context.triggerHandler('currentVisible'),
                        value = typeof visible !== 'undefined' ? visible.length : 1;

                return Math.floor(value / 2);
            },
            getDirection: function ($context, $element) {
                var visible = $context.triggerHandler('currentVisible');
                if (visible) {
                    var center = Math.floor(visible.length / 2),
                            index = $element.index();
                    if (index >= center) {
                        return 'next';
                    }
                    return 'prev';
                }
            },
            adjustCarousel: function ($context) {
                if ($context.closest('.twg-wrap').length > 0) {
                    var visible = $context.triggerHandler('currentVisible'),
                            visibleLength = typeof visible !== 'undefined' ? visible.length : 1,
                            liWidth = $('li:first-child', $context).width();

                    $context.triggerHandler('configuration', {width: '' + liWidth * visibleLength, responsive: false});
                    $context.parent().css('width', (liWidth * visible) + 'px');
                }
            }
        };

// Initialize carousels //////////////////////////////
        function createCarousel(obj) {
            obj.each(function () {
                if ($(this).closest('.carousel-ready').length > 0) {
                    return true;
                }
                var $this = $(this),
                        id = $this.data('id'),
                        autoSpeed = 'off' !== $this.data('autoplay') ? parseInt($this.data('autoplay'), 10) : 0,
                        sliderArgs = {
                            responsive: true,
                            circular: ('yes' === $this.data('wrap')),
                            infinite: true,
                            height: 'auto',
                            swipe: true,
                            scroll: {
                                items: $this.data('scroll') ? parseInt($this.data('scroll'), 10) : 1,
                                fx: $this.data('effect'),
                                duration: parseInt($this.data('speed')),
                                onBefore: function () {
                                    var $twgWrap = $this.closest('.twg-wrap'),
                                            $timer = $('.timer-bar', $twgWrap);
                                    if ($timer.length > 0) {
                                        Themify_Carousel_Tools.timer($timer, $this.data('id'), autoSpeed, 20);
                                        Themify_Carousel_Tools.unhighlight($this);
                                    }
                                },
                                onAfter: function (items) {
                                    var newItems = items.items.visible;
                                    var $twgWrap = $this.closest('.twg-wrap');
                                    if ($twgWrap.length > 0) {
                                        var $center = newItems.filter(':eq(' + Themify_Carousel_Tools.getCenter($this) + ')');
                                        $('.twg-link', $center).trigger(themifyScript.galleryEvent);
                                        Themify_Carousel_Tools.highlight($center);
                                    }
                                }
                            },
                            auto: {
                                play: ('off' !== $this.data('autoplay')),
                                timeoutDuration: autoSpeed
                            },
                            items: {
                                visible: {
                                    min: 1,
                                    max: $this.data('visible') ? parseInt($this.data('visible'), 10) : 1
                                },
                                width: $this.data('width') ? parseInt($this.data('width'), 10) : 222
                            },
                            prev: {
                                button: 'yes' === $this.data('slidernav') ? '#' + id + ' .carousel-prev' : null
                            },
                            next: {
                                button: 'yes' === $this.data('slidernav') ? '#' + id + ' .carousel-next' : null
                            },
                            pagination: {
                                container: 'yes' === $this.data('pager') ? '#' + id + ' .carousel-pager' : null,
                                anchorBuilder: function () {
                                    if ($this.closest('.testimonial.slider').length > 0) {
                                        var thumb = $('.testimonial-post', this).data('thumb'),
                                                thumbw = $('.testimonial-post', this).data('thumbw'),
                                                thumbh = $('.testimonial-post', this).data('thumbh');
                                        return '<span><a href="#"><img src="' + thumb + '" width="' + thumbw + '" height="' + thumbh + '" /></a></span>';
                                    }
                                    if (($this.closest('.portfolio-multiple.slider').length > 0) || ($this.closest('.team-multiple.slider').length > 0)) {
                                        return '<a href="#"></a>';
                                    }
                                    return false;
                                }
                            },
                            onCreate: function () {
                                var $slideshowWrap = $this.closest('.slideshow-wrap'),
                                        $teamSliderWrap = $this.closest('.team-multiple.slider'),
                                        $portfolioSliderWrap = $this.closest('.portfolio-multiple.slider'),
                                        $testimonialSlider = $this.closest('.testimonial.slider'),
                                        $twgWrap = $this.closest('.twg-wrap');

                                $this.closest('.slider').prevAll('.slideshow-slider-loader').first().remove(); // remove slider loader

                                if ($testimonialSlider.closest('.fp-tableCell').length === 0) {
                                    $slideshowWrap.css({
                                        'visibility': 'visible',
                                        'height': 'auto'
                                    }).addClass('carousel-ready');
                                } else {
                                    $slideshowWrap.css({
                                        'height': 'auto'
                                    }).addClass('carousel-ready');
                                }

                                if ($testimonialSlider.length > 0) {
                                    if ($testimonialSlider.closest('.fp-tableCell').length !== 0 || $('body').hasClass('themify_builder_active')) {
                                        $testimonialSlider.css({
                                            'visibility': 'visible',
                                            'height': 'auto'
                                        });
                                    }
                                    $('.carousel-pager', $slideshowWrap).addClass('testimonial-pager');
                                }

                                if ($teamSliderWrap.length > 0) {
                                    $teamSliderWrap.css({
                                        'visibility': 'visible',
                                        'height': 'auto'
                                    });
                                    $('.carousel-prev, .carousel-next', $teamSliderWrap).text('');
                                }
                                if ($portfolioSliderWrap.length > 0) {
                                    $portfolioSliderWrap.css({
                                        'visibility': 'visible',
                                        'height': 'auto'
                                    });
                                    $('.carousel-prev, .carousel-next', $portfolioSliderWrap).text('');
                                }

                                if ('no' === $this.data('slidernav')) {
                                    $('.carousel-prev', $slideshowWrap).remove();
                                    $('.carousel-next', $slideshowWrap).remove();
                                }

                                if ($twgWrap.length > 0) {

                                    var center = Themify_Carousel_Tools.getCenter($this),
                                            $center = $('li', $this).filter(':eq(' + center + ')'),
                                            $inTableCell = $('.twg-slider').parents('.row_inner').parents('.fp-tableCell');

                                    Themify_Carousel_Tools.highlight($center);

                                    $this.triggerHandler('slideTo', [-center, {duration: 0}]);

                                    $('.carousel-pager', $twgWrap).remove();
                                    $('.carousel-prev', $twgWrap).addClass('gallery-slider-prev').text('');
                                    $('.carousel-next', $twgWrap).addClass('gallery-slider-next').text('');

                                    if ($inTableCell.length > 0) {
                                        $inTableCell.css('display', 'block');
                                    }
                                }

                                $(window).on('tfsmartresize', function () {
                                    // Get all the possible height values from the slides
                                    var heights = $this.children().map(function () {
                                        return $(this).height();
                                    });
                                    // Find the max height and set it
                                    $this.parent().add($this).height(Math.max.apply(null, heights));
                                }).triggerHandler('resize');

                                Themify_Carousel_Tools.adjustCarousel($this);
                            }
                        };

                // Fix unresponsive js script when there are only one slider item
                if ($this.children().length < 2) {
                    sliderArgs.onCreate();
                    return true; // skip initialize carousel on this element
                }

                $this.carouFredSel(sliderArgs).find('li').on(themifyScript.galleryEvent, function () {
                    if ($this.closest('.twg-wrap').length > 0) {
                        var $thisli = $(this);
                        $('li', $this).removeClass('current');
                        $thisli.addClass('current')
                                .triggerHandler('slideTo', [
                                    $thisli,
                                    -Themify_Carousel_Tools.getCenter($this),
                                    false,
                                    {
                                        items: 1,
                                        duration: 300,
                                        onBefore: function () {
                                            var $twgWrap = $this.closest('.twg-wrap'),
                                                    $timer = $('.timer-bar', $twgWrap);
                                            if ($timer.length > 0) {
                                                Themify_Carousel_Tools.timer($timer, $this.data('id'), autoSpeed, 20);
                                                Themify_Carousel_Tools.unhighlight($this);
                                            }
                                        },
                                        onAfter: function (items) {
                                        }
                                    },
                                    null,
                                    Themify_Carousel_Tools.getDirection($this, $thisli)]
                                        );
                    }
                });

                /////////////////////////////////////////////
                // Resize thumbnail strip on window resize
                /////////////////////////////////////////////
                $(window).on('tfsmartresize', Themify_Carousel_Tools.adjustCarousel($this));

            });
        }

// Get builder rows anchor class to ID //////////////////////////////
        function getClassToId($section) {
            var classes = $section.prop('class').split(' '),
                    expr = new RegExp('^tb_section-', 'i'),
                    spanClass = null;
            for (var i = 0; i < classes.length; i++) {
                if (expr.test(classes[i])) {
                    spanClass = classes[i];
                }
            }

            if (spanClass === null)
                return '';

            return spanClass.replace('tb_section-', '');
        }

// Create fullpage scrolling //////////////////////////////
        function createFullScrolling() {
            var $body = Themify.body,
                autoScrolling = !(!usesRows && '' != themifyScript.hash.replace('#', '')),
                $wrapper = $(sectionsWrapper),
                scrollingStyle = !$body[0].classList.contains('full-section-scrolling-single'),
                isParralax=$body[0].classList.contains('fullpage-parallax-scrolling-enabled'),
                rows = document.getElementsByClassName('module_row')[0],
                $sectionClass=null,
                slideCl = slideClass.replace('.',''),
                items=null;


            if (rows!==undefined) {

                   var temp = document.getElementsByClassName(slideCl)[0];
                    if (temp !== undefined) {
                        temp.classList.remove(slideCl);
                    }
                    temp = null;
                    var $sectionClass = $(sectionsWrapper + '>' + sectionClass);
                    $sectionClass.each(function () {
                        var $current = $(this),
                            f = document.createDocumentFragment(),
                            cl = this.classList,
                            wrap = document.createElement('div');
                        while (true) {
                            var next = $current.next()[0];
                            if (next !== undefined && next.classList.contains(slideCl)) {
                                f.appendChild(next);
                            } else {
                                break;
                            }
                        }
                        wrap.className = 'section-container';
                        for (var i = cl.length - 1; i > -1; --i) {
                            if (cl[i] !== 'fullwidth' && cl[i] !== 'fullcover' && cl[i].indexOf('module_row_') !== 0 && cl[i].indexOf('tb_') !== 0) {
                                wrap.className += ' ' + cl[i];
                            }
                        }
                        cl.add(slideCl);
                        this.parentNode.insertBefore(wrap, this);
                        wrap.appendChild(this);
                        wrap.appendChild(f);
                        wrap.style['display'] = 'block';
                    });

                items = document.getElementsByClassName(slideCl);
                for (var i = items.length - 1; i > -1; --i) {
                    items[i].parentNode.style['display'] = 'none';
                    var inner = items[i].getElementsByClassName('row_inner'),
                            $this = $(items[i]),
                            paddingTop = $this.css('padding-top').replace(/%/g, 'vh'),
                            paddingBottom = $this.css('padding-bottom').replace(/%/g, 'vh');
                    for (var j = inner.length - 1; j > -1; --j) {
                        inner[j].style['paddingTop'] = paddingTop;
                        inner[j].style['paddingBottom'] = paddingBottom;
                    }
                    items[i].style['paddingTop'] = items[i].style['paddingBottom'] = 0;
                    items[i].parentNode.style['display'] = '';
                }
            }
            var sectionAnchors = [];
            $sectionClass.each(function () {
                    var cl = this.classList,
                        section_anchor ='';
                    for(var i=cl.length-1;i>-1;--i){
                        if(cl[i].indexOf('tb_section-')===0){
                            section_anchor = getClassToId($(this));
                            break;
                        }
                    }
                $(this).data('anchor', section_anchor);
                sectionAnchors.push(section_anchor);
            });
            $sectionClass=null;
            var menu=document.getElementById('main-nav'),
                $menu=$(menu);
            if ( usesRows && items!==null && menu!==null) {
                for(var i=items.length-1;i>-1;--i){
                    var slide_id=null,
                        cl = items[i].classList,
                        $this=$(items[i]);
                    for(var j=cl.length-1;j>-1;--j){
                        if(cl[j].indexOf('tb_section-')===0){
                            slide_id = getClassToId($this);
                            break;
                        }
                    }
                    if(slide_id===null){
                        slide_id=items[i].id;
                    }
                    if(slide_id){
                        var $aSectionHref = menu.querySelector('a[href$="#' + slide_id + '"]');
                        if ($aSectionHref!==null) {
                            var section_id = $this.closest('.module_row').data('anchor');
                            if(section_id){
                                $($aSectionHref).attr('href', '#' + section_id + '/' + slide_id).closest('li').attr('data-menuanchor', section_id + '/' + slide_id);
                            }
                        }
                    }
                }
            }
            items=null;
            
            $wrapper.fullpage({
                resize: false,
                sectionSelector: '.section-container',
                slideSelector: slideClass,
                scrollOverflow: true,
                navigation: true,
                lockAnchors: true,
                verticalCentered: true,
                anchors: sectionAnchors,
                menu: menu!==null?'#'+menu.id:'',
                autoScrolling: autoScrolling,
                scrollOverflowOptions: {
                    hideScrollbars: true,
                    preventDefault: false
                },
                scrollHorizontally: scrollingStyle,
                scrollHorizontallyKey: 'QU5ZX1UycmMyTnliMnhzU0c5eWFYcHZiblJoYkd4NWhLbA==',
                slidesNavigation: true,
                parallax: isParralax,
                parallaxKey: 'QU5ZX0FodGNHRnlZV3hzWVhnPXY1bA==',
                parallaxOptions: {
                    type: 'reveal',
                    percentage: 62,
                    property: 'translate'
                },
                afterRender: function () {
                    if (!autoScrolling) { // hack deep linking not working when use section row
                        $.fn.fullpage.setAutoScrolling(true);
                    }

                    var $section = $('.section-container.active').find(slideClass + '.active, .section'),
                            section_id = usesRows && $section.is('[class*="tb_section-"]') ? getClassToId($section) : $section.prop('id'),
                            $aSectionHref = is_horizontal_scrolling ? $menu.find('a[href$="#main/' + section_id + '"]') : $menu.find('a[href$="#' + section_id + '"]');


                    if (usesRows) {
                        var extraEmptyRow = $('#fp-nav').find('li').get($wrapper.children(sectionClass).length);

                        if ('undefined' !== typeof extraEmptyRow) {
                            $(extraEmptyRow).remove();
                        }
                    }

                    $body.on({
                        mouseenter: function () {
                            var t = $(this).find('a').attr('href');
                            t = t.replace('#', '');
                            if( t.length ){
                                $('<div class="multiscroll-tooltip">' + t + "</div>").hide().appendTo($(this)).fadeIn(200);
                            }
                        },
                        mouseleave: function () {
                            $(this).find(".multiscroll-tooltip").fadeOut(200, function () {
                                $(this).remove();
                            });
                        }
                    }, "#fp-nav li");

                    if ($aSectionHref.length > 0) {
                        $aSectionHref.closest('li').addClass('current_page_item').siblings().removeClass('current_page_item current-menu-item');

                        if (history.pushState) {
                            history.pushState(null, null, is_horizontal_scrolling ? '#main/' + section_id : '#' + section_id);
                        }
                    }

                    var coverSelectors = '.builder_row_cover, .row-slider, .column-slider, .subrow-slider',
                            rowCovers = $(sectionClass).find('.fp-tableCell, .fp-scrollable').children(coverSelectors);

                    if (rowCovers.length) {
                        rowCovers.each(function () {
                            var row = $(this).closest('.module_row');
                            !row.is(coverSelectors) && row.prepend(this);
                        });
                    }

                    $body.triggerHandler('themify_onepage_after_render', [$section, section_id]);

                    function backgroundImage() {
                        $('.module_row_slide').each(function () {
                            var $fpBackground = $('<div>', {class: 'fp-bg'});
                            $fpBackground.css({
                                'background-image': $(this).css('background-image'),
                                /**
                                 * Note: Builder row overlay and background video are at z-index 0
                                 */
                                'z-index': 0
                            });
                            $(this).css('background-image', 'none').prepend($fpBackground);
                        });
                    }

                    if (isParralax) {
                        if (document.querySelector( '.module_row_slide[data-fullwidthvideo]' )!==null) {
                            $body.one('tb_bigvideojs_loaded', backgroundImage);
                        } else {
                            backgroundImage();
                        }
                    }
                },
                afterLoad: function (anchorLink, index) {
                    var $section = $wrapper.children(sectionClass + '.active'),
                            section_id = $section.data('anchor'),
                            slide = $section.find(slideClass + '.active'),
                            slide_id = slide.data('anchor'),
                            $aSectionHref = $menu.find('a[href$="#' + section_id + '/' + slide_id + '"]');

                    if ($aSectionHref.length > 0) {
                        $aSectionHref.closest('li').addClass('current_page_item').siblings().removeClass('current_page_item current-menu-item');
                        history.pushState(null, null, '#' + slide_id);
                    } else {
                        $menu.find('li').removeClass('current_page_item current-menu-item');
                        if (first_load_counter >= 2) {
                            if( !section_id || !slide_id){
                                history.pushState(null, null, location.pathname);
                            }else{
                                history.pushState(null, null, '#' + slide_id);
                            }
                        } else {
                            first_load_counter += 1;
                        }
                    }
                    setTimeout(function () {
                        var currentVideo = $('.fp-section').eq(index - 1).find('.big-video-wrap').find('iframe, video');
                        if (currentVideo.length) {
                            currentVideo.each(function () {
                                if (typeof this.play === 'function') {
                                    this.play();
                                } else {
                                    this.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                                }
                            });
                        }
                    }, 1000);

                    $body.triggerHandler('themify_onepage_afterload', [$section, section_id]);
                },
                onLeave: function (index, nextIndex, direction) {


                    var userAgent = window.navigator.userAgent;

                    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
                        $body.removeClass('fullpagescroll-up fullpagescroll-down').addClass('fullpagescroll-' + direction);
                    }
                    // when lightbox is active, prevent scrolling the page
                    if ($body.find('> .mfp-wrap').length > 0) {
                        return false;
                    }
                    if (index > 0 && nextIndex > 0) {
                        var $rows = usesRows ? $(sectionsWrapper).children('.section-container') : $(sectionsWrapper).find(sectionClass);
                        if ($rows.length > 0) {
                            var sectionIndex = index;
                            if ('up' === direction) {
                                for (sectionIndex = index; sectionIndex >= nextIndex; sectionIndex--) {
                                    $rows.eq(sectionIndex - 1).find('.module_row').css('visibility', 'visible');
                                }
                            } else {
                                for (sectionIndex = index; sectionIndex <= nextIndex; sectionIndex++) {
                                    $rows.eq(sectionIndex - 1).find('.module_row').css('visibility', 'visible');
                                }
                            }
                        }
                    }
                    // Play BG video when slide is in viewport
                    var currentVideo = $('.fp-section').eq(nextIndex - 1).find('.big-video-wrap').find('iframe, video');
                    if (currentVideo.length) {
                        setTimeout(function () {
                            currentVideo.each(function () {
                                if (typeof this.play === 'function') {
                                    this.play();
                                } else {
                                    this.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                                }
                            });
                        }, 100);
                    }
                },
                afterSlideLoad: function (section, origin, destination, direction) {
                    var $section = $wrapper.children(sectionClass + '.active'),
                        section_id = $section.data('anchor'),
                        slide = $section.find(slideClass + '.active'),
                        slide_id = slide.data('anchor'),
                        $aSectionHref = $menu.find('a[href$="#' + section + '/' + destination + '"]');
                        if($aSectionHref.length===0){
                            $aSectionHref = $menu.find('a[href$="#' + destination + '/' + destination + '"]');
                        }
                    if ($aSectionHref.length > 0) {
                        $aSectionHref.closest('li').addClass('current_page_item').siblings().removeClass('current_page_item current-menu-item');
                        history.pushState(null, null, '#' + destination);
                    } else {
                        $menu.find('li').removeClass('current_page_item current-menu-item');
                        if (first_slide_counter >= 2) {
                            if( !section_id || !slide_id){
                                history.pushState(null, null, location.pathname);
                            }else{
                                history.pushState(null, null, '#' + destination);
                            }
                        } else {
                            first_slide_counter += 1;
                        }
                    }
                    // Play BG video when slide is in viewport
                    setTimeout(function () {
                        var currentVideo = $section.find('.big-video-wrap').find('iframe, video');

                    if (currentVideo.length) {
                            currentVideo.each(function () {
                                if (typeof this.play === 'function') {
                                    this.play();
                                } else {
                                    this.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                                }
                            });
                    }
                    }, 1000);
			
                    $body.triggerHandler('themify_onepage_afterload');
                },
                onSlideLeave: function (anchorLink, index, slideIndex, direction, nextSlideIndex, nextSlide) {
                    var $slides = $('.section-container').find(slideClass);
                    $body.triggerHandler('themify_onepage_slide_onleave', [$slides.eq(nextSlideIndex)]);
                    if ('left' === direction) {
                        for (var i = slideIndex; i > nextSlideIndex; --i) {
                            $slides.eq(i - 1).css('visibility', 'visible');
                        }
                    } else if ('right' === direction) {
                        for (var i = slideIndex; i < nextSlideIndex; ++i) {
                            $slides.eq(i + 1).css('visibility', 'visible');
                        }
                    }
                }
            });
        }

// Apply auto column position element class /////////////////////////
        AutoColumnClass = {
            init: function () {
                this.setup();
            },
            setup: function () {
                // shortcode columns add class
                $('.module_column.first').each(function () {
                    var $this = $(this);
                    if (this.classList.contains('col2-1')) {
                        $this.next('.col2-1').addClass('last');
                        $this.next('.col4-1').addClass('third').next('.col4-1').addClass('last');
                    } else if (this.classList.contains('col3-1')) {
                        $this.next('.col3-1').addClass('second').next('.col3-1').addClass('last');
                        $this.next('.col3-2').addClass('last');
                    } else if (this.classList.contains('col3-2')) {
                        $this.next('.col3-1').addClass('last');
                    } else if (this.classList.contains('col4-1')) {
                        $this.next('.col4-1').addClass('second').next('.col4-1').addClass('third').next('.col4-1').addClass('last');
                        $this.next('.col4-2').addClass('second');
                    } else if (this.classList.contains('col4-2')) {
                        $this.next('.col4-2').addClass('last');
                        $this.next('.col4-1').addClass('third').next('.col4-1').addClass('last');
                    } else if (this.classList.contains('col4-3')) {
                        $this.next('.col4-1').addClass('last');
                    }
                });
                $('.col-full').each(function (i) {
                    if (i % 2 === 0) {
                        $(this).addClass('animate-last');
                    } else {
                        $(this).addClass('animate-first');
                    }
                });
            }
        };

// Scroll to Element //////////////////////////////
        function themeScrollTo(offset) {
            $('body,html').animate({scrollTop: offset}, 800);
        }

// DOCUMENT READY

        var $window = $(window),
                $body = Themify.body,
                $charts = $('.chart', $body),
                $skills = $('.progress-bar', $body);

        //////////////////////
        // Slide menu
        //////////////////////
        $('#menu-icon').themifySideMenu({
            close: '#menu-icon-close'
        });

        var $overlay = $('<div class="body-overlay">');
        $body.append($overlay).on('sidemenushow.themify', function () {
            $overlay.addClass('body-overlay-on');
        }).on('sidemenuhide.themify', function () {
            $overlay.removeClass('body-overlay-on');
        }).on('click.themify touchend.themify', '.body-overlay', function () {
            $('#menu-icon-close').trigger('click');
        })
        /* recalculation of each waypoint’s trigger point, required for modules that use waypoints */
        .on('themify_onepage_afterload themify_onepage_after_render', function (e, $section, section_id) {
            if ($.fn.waypoint) {
                Waypoint.refreshAll();
            }
            if(e.type==='themify_onepage_afterload' && tbLocalScript && tbLocalScript.animationInviewSelectors && typeof ThemifyBuilderModuleJs !== 'undefined' && ThemifyBuilderModuleJs.wow){
                 var $slide = $(sectionClass + '.active', $(sectionsWrapper)).find(slideClass + '.active');
                // Trigger wow display for elements in this panel

                    $(tbLocalScript.animationInviewSelectors).each(function (i, selector) {
                        $(selector, $slide).each(function () {
                            ThemifyBuilderModuleJs.wow.show(this);
                        });
                    });
            }
        });
        $window.on('resize', function () {
            if ($('#mobile-menu').hasClass('sidemenu-on') && $('#menu-icon').is(':visible')) {
                $overlay.addClass('body-overlay-on');
            }
            else {
                $overlay.removeClass('body-overlay-on');
            }
        });
        /////////////////////////////////////////////
        // Chart Initialization
        /////////////////////////////////////////////
        if ($charts.length > 0) {
            if (!$.fn.easyPieChart) {
                Themify.LoadAsync(themify_vars.url + '/js/jquery.easy-pie-chart.min.js', ThemifyChart, null, null, function () {
                    return typeof $.fn.easyPieChart !== 'undefined';
                });
            }
            else {
                ThemifyChart();
            }
        }
        function ThemifyChart() {
            $.each(themifyScript.chart, function (index, value) {
                if ('false' == value || 'true' == value) {
                    themifyScript.chart[index] = 'false' != value;
                } else if (parseInt(value)) {
                    themifyScript.chart[index] = parseInt(value);
                } else if (parseFloat(value)) {
                    themifyScript.chart[index] = parseFloat(value);
                }
            });

            for (var i = 0, len = $charts.length; i < len; ++i) {
                var $self = $charts.eq(i),
                        barColor = $self.data('color'),
                        percent = $self.data('percent');
                if ('undefined' !== typeof barColor) {
                    themifyScript.chart.barColor = '#' + barColor.toString().replace('#', '');
                }
                $self.easyPieChart(themifyScript.chart);
                $self.data('easyPieChart').update(0);
            }

            if (isFullPageScroll && $body.hasClass('query-section')) {
                $body.on('themify_onepage_afterload themify_onepage_after_render', function (event, $section, section_id) {
                    var chartLength = $section.find('.chart').length;
                    for (var i = 0; i < chartLength; i++) {
                        var $self = $section.find('.chart').eq(i),
                                percent = $self.data('percent');
                        $self.data('easyPieChart').update(percent);
                    }
                });
            } else {
                for (var i = 0, len = $charts.length; i < len; ++i) {
                    var $self = $charts.eq(i),
                            percent = $self.data('percent');
                    if (typeof $.fn.waypoint !== 'undefined') {
                        $self.waypoint(function (direction) {
                            $self.data('easyPieChart').update(percent);
                        }, {offset: '80%'});
                    } else {
                        $self.data('easyPieChart').update(percent);
                    }
                }
            }
        }

        /////////////////////////////////////////////
        // Skillset Animation
        /////////////////////////////////////////////
        for (var i = 0; i < $skills.length; i++) {
            $('span', $skills.eq(i)).width('0%');
        }
        /////////////////////////////////////////////
        // Transition Animation ( FlyIn or FadeIn )
        /////////////////////////////////////////////
        AutoColumnClass.init(); // apply auto column class
        if (isFullPageScroll && $body.hasClass('query-section')) {
            function animate_skills_progress_bars($progressBars) {
                if ($progressBars.length > 0) {
                    $progressBars.find('span').each(function () {
                        var $bar = $(this),
                                percent = $bar.data('percent');
                        if ('undefined' !== typeof percent) {
                            $bar.delay(200).animate({
                                width: percent
                            }, 800);
                        }
                    });
                }
            }


            var runAnimation = function ($section, section_id) {
                if ('undefined' !== typeof ThemifyBuilderModuleJs && ThemifyBuilderModuleJs.wow !== null && typeof ThemifyBuilderModuleJs.wow.scrollHandler() === 'boolean') {
                    ThemifyBuilderModuleJs.wow.scrollHandler();
                }

                if ($section.length > 0 && 'undefined' !== typeof tbLocalScript && tbLocalScript.isAnimationActive) {
                    // show animation
                    $section.find('.section-title').addClass('animated fadeInLeftBig')
                            .end().find('.section-content').addClass('animated flyInBottom');
                }
            };
            $body.on('themify_onepage_afterload themify_onepage_after_render', function (event, $section, section_id) {
                // Skillset
                var $slide = $(sectionClass + '.active', $(sectionsWrapper)).find(slideClass + '.active');
                animate_skills_progress_bars($slide.find('.progress-bar'));
                $section = $(sectionClass + '.active').find(slideClass + '.active');
                runAnimation($section, section_id);
            });

        } else {
            $skills.each(function () {
                var $this = $(this),
                        percent = $('span', $this).data('percent');
                if (typeof $.fn.waypoint !== 'undefined') {
                    $this.waypoint(function (direction) {
                        $this.find('span').each(function () {
                            var $bar = $(this),
                                    percent = $bar.data('percent');
                            if ('undefined' !== typeof percent) {
                                $bar.delay(200).animate({
                                    width: percent
                                }, 800);
                            }
                        });
                    }, {offset: '80%'});
                } else {
                    $('span', $skills.eq(i)).width(percent);
                }
            });

            if ('undefined' !== typeof $.fn.waypoints && 'undefined' !== typeof tbLocalScript && tbLocalScript.isAnimationActive) {
                $(sectionsWrapper).children(sectionClass).each(function () {
                    var $this = $(this);
                    $this.waypoint(function () {
                        $this.find('.section-title').addClass('animated fadeInLeftBig')
                                .end().find('.section-content').addClass('animated flyInBottom');
                    }, {offset: '50%'});
                });
            }
        }

        /////////////////////////////////////////////
        // Scroll to top
        /////////////////////////////////////////////
        $('.back-top a').on('click', function (e) {
            e.preventDefault();
            themeScrollTo(0);
        });

        /////////////////////////////////////////////
        // Toggle main nav on mobile
        /////////////////////////////////////////////
        if (is_touch_device() && typeof $.fn.themifyDropdown != 'function') {
            Themify.LoadAsync(themify_vars.url + '/js/themify.dropdown.js', function () {
                $('#main-nav').themifyDropdown();
            });
        }

        $body.on('click', '#menu-icon', function (e) {
            e.preventDefault();
            //$('#main-nav').fadeToggle();
            $('#top-nav', $('#headerwrap')).hide();
            $(this).toggleClass('active');
        });

        /////////////////////////////////////////////
        // Add class "first" to first elements
        /////////////////////////////////////////////
        $('.highlight-post:odd').addClass('odd');

        /////////////////////////////////////////////
        // Fullscreen bg
        /////////////////////////////////////////////
        if ('undefined' !== typeof $.fn.backstretch) {
            var $sectionPost = $(sectionClass);
            $sectionPost.each(function () {
                var bg = $(this).data('bg');
                if ('undefined' !== typeof bg) {
                    if ($(this).hasClass('fullcover')) {
                        $(this).backstretch(bg);
                    } else {
                        $(this).css('background-image', 'url(' + bg + ')');
                    }
                }
            });
            $window.on('backstretch.show', function (e, instance) {
                instance.$container.css('z-index', '');
            })
                    .on('tfsmartresize', function () {
                        $sectionPost.each(function () {
                            if ($(this).hasClass('fullcover')) {
                                var instance = $(this).data("backstretch");
                                if ('undefined' !== typeof instance)
                                    instance.resize();
                            }
                        });
                    });
        }

        /////////////////////////////////////////////
        // Single Gallery Post Type
        /////////////////////////////////////////////
        if ($('body.single-gallery').length > 0) {
            Themify.LoadAsync(themify_vars.includesURL + 'js/imagesloaded.min.js', function () {
                Themify.LoadAsync(themify_vars.includesURL + 'js/masonry.min.js', function () {
                    $('.gallery-type-gallery').imagesLoaded(function () {
                        $('.gallery-type-gallery').masonry({
                            itemSelector: '.item',
                            isFitWidth: true,
                            isAnimated: false
                        })
                    });
                }, null, null, function () {
                    return ('undefined' !== typeof $.fn.masonry);
                });
            }, null, null, function () {
                return ('undefined' !== typeof $.fn.imagesLoaded);
            });
        }

        /////////////////////////////////////////////
        // One Page Scroll
        /////////////////////////////////////////////
        themifyScript.hash = window.location.hash.replace('#', '').replace('!/', '');
        if (isFullPageScroll) {
            if (typeof $.fn.fullpage === 'undefined') {
                Themify.LoadAsync(themifyScript.themeURI + "/js/jquery.fullpage.extensions.min.js", function () {
                    $body.triggerHandler('themify_fullpage_afterload');
                }, null, null, function () {
                    return "undefined" !== typeof $.fn.fullpage;
                });
            }
            if ($body.hasClass('query-section')) {
                // Get rid of wow js animation since animation is managed with fullpage js
                var callbackTimer = setInterval(function () {
                    var call = false;
                    try {
                        call = ('undefined' !== typeof ThemifyBuilderModuleJs);
                    } catch (e) {
                    }

                    if (call) {
                        clearInterval(callbackTimer);
                        wowInit2 = ThemifyBuilderModuleJs.wowInit;
                        ThemifyBuilderModuleJs.wowInit = function () {
                        };
                    }
                }, 100);
                $body.on('themify_fullpage_afterload', function () {
                    createFullScrolling();
                });
                if ($(window.frameElement).is('#tb_iframe')) {
                    if (typeof $.fn.fullpage === 'undefined') {
                        Themify.LoadAsync(themifyScript.themeURI + "/js/jquery.fullpage.extensions.min.js", function () {
                            $body.triggerHandler('themify_fullpage_afterload');
                            $.fn.fullpage.destroy('all');
                        }, null, null, function () {
                            return "undefined" !== typeof $.fn.fullpage;
                        });
                    }
                }
            }
        }
        var $mainNav = $('#main-nav'),
                $mobileMenu = $('#mobile-menu'),
                $menuIconClose = $('#menu-icon-close');

        function cleanupURL(url) {
            return url.replace(/#.*$/, '').replace(/\/$/, '');
        }
        $body.one('themify_fullpage_afterload', function () {
            $body.on('click', 'a[href*="#"]:not([href="#"])', function (e) {
                var slide_id = $(this).prop('hash'),
                        slideNoHashWithSlash = slide_id.replace(/#/, '' ).split('/'),
                        slideNoHash = slideNoHashWithSlash[slideNoHashWithSlash.length-1],
                        sectionEl = usesRows ? '.tb_section-' + slideNoHash + ':not(' + sectionClass + ')' : slide_id;
                if ($(sectionEl).length && cleanupURL(window.location.href) === cleanupURL($(this).prop('href'))) {
                    e.preventDefault();
                    if (isFullPageScroll && $body.hasClass('query-section')) {
                        var slide_index = $(sectionEl).index();
                        $.fn.fullpage.moveTo($(sectionEl).closest('.section-container').index() + 1, slide_index)
                        $(sectionEl).css('visibility', 'visible');
                    } else {
                        var offset = $(sectionEl).offset().top;
                        themeScrollTo(offset);
                    }
                    setTimeout(function () {
                        window.location.hash = slideNoHash;
                    }, 800);
                }

                // close mobile menu
                var menuTriggerPoint = tf_mobile_menu_trigger_point || 1200;

                if ($window.width() <= menuTriggerPoint && $mainNav.is(':visible') && $mobileMenu.hasClass('sidemenu-on')) {
                    $menuIconClose.trigger('click');
                }
            });
        });
        /////////////////////////////////////////////
        // Portfolio Expander
        /////////////////////////////////////////////
        if ('undefined' !== typeof $.fn.themifyPortfolioExpander) {
            $body.themifyPortfolioExpander({
                itemContainer: '.shortcode.portfolio',
                animeasing: 'easeInQuart',
                animspeed: 500
            });
        }

        /////////////////////////////////////////////
        // Footer Toggle
        /////////////////////////////////////////////
        $('#footer-tab').on('click', 'a', function (e) {
            e.preventDefault();
            $('#footerwrap-inner').slideToggle();
            $('#footerwrap').toggleClass('expanded');
        });

        /////////////////////////////////////////////
        // Fullcover Gallery
        /////////////////////////////////////////////
        function fullCoverGallery(el) {
            var $contexts = $(sectionClass + '.gallery, .twg-slider', el);
            if ($contexts.length > 0) {
                var areaHeight = $window.height() + 5,
                        fullPageOn = isFullPageScroll && $body.hasClass('query-section');
                $contexts.find('.gallery-image-holder').each(function () {
                    var $self = $(this),
                            thisAreaHeight = areaHeight,
                            $section = $self.closest(sectionClass),
                            $sectionTitle = $section.find('.section-title'),
                            $adminBar = $('#wpadminbar');
                    // If this gallery is placed inside a section
                    if ($section.length > 0) {
                        $section.css('paddingBottom', 0);
                        if ($sectionTitle.length > 0) {
                            thisAreaHeight -= $sectionTitle.outerHeight(true);
                        }
                        if ($('#headerwrap').length > 0) {
                            thisAreaHeight -= $('#headerwrap').outerHeight(true);
                            if ($body.hasClass('menubar-top')) {
                                $self.css('marginTop', $('#headerwrap').outerHeight(true));
                            }
                        }
                    }
                    if ($adminBar.length > 0) {
                        thisAreaHeight -= $adminBar.outerHeight();
                    }
                    $self.css({minHeight: thisAreaHeight + 'px'});
                });
                if (!fullPageOn) {
                    $contexts.find('.gallery-slider-wrap').css({bottom: ''});
                }
            }
        }
        if (!Themify.is_builder_active) {
            fullCoverGallery();
        }
        else {
            Themify.body.on('builder_load_module_partial', function (e, el, type) {
                fullCoverGallery(el);
            });
        }


        $window.on('tfsmartresize', function () {
            fullCoverGallery();
            var in_customizer = false,
                    userAgent = window.navigator.userAgent;

            // check for wp.customize return boolean
            if (typeof wp !== 'undefined') {
                in_customizer = typeof wp.customize !== 'undefined' ? true : false;
            }
            // Added Android useragent to avoid closure of mobile menu on resize
            if ((!in_customizer) && (!userAgent.match(/Android/i))) {
                $('#menu-icon-close').trigger('click');
            }
        })
        .on('load', function () {
            var $body = Themify.body;

            // scrolling nav
            if ('undefined' !== typeof $.fn.themifySectionHighlight) {
                if (isFullPageScroll && $body.hasClass('query-section')) {
                    $body.on('themify_onepage_after_render', function () {
                        $body.themifySectionHighlight();
                    });
                } else {
                    $body.themifySectionHighlight();
                }
                $body.on('scrollhighlight.themify', function (e, section) {
                    if ('undefined' !== typeof section && '' != section) {
                        $('#fp-nav').find('li').eq($('.tb_section-' + section.replace('#', '')).index()).find('a').trigger('click');
                    }
                });
                $window.triggerHandler('scroll');
            }

            /////////////////////////////////////////////
            // Carousel initialization
            /////////////////////////////////////////////
            var carouselSlideshow = function (el) {
                var slideShow = $('.slideshow', el);
                if (slideShow.length > 0) {
                    if (!$.fn.carouFredSel) {
                        Themify.LoadAsync(themify_vars.url + '/js/carousel.min.js', function () {
                            createCarousel(slideShow);
                        }, null, null, function () {
                            return typeof $.fn.carouFredSel !== 'undefined';
                        });
                    }
                    else {
                        createCarousel(slideShow);
                    }
                }
            },
                    initGallery = function (el) {
                        var galler = $('.twg-wrap', el);
                        /////////////////////////////////////////////
                        // Initialize WordPress Gallery in Section
                        /////////////////////////////////////////////
                        if ('undefined' !== typeof $.fn.ThemifyWideGallery && galler.length > 0) {
                            galler.ThemifyWideGallery({
                                speed: parseInt(themifyScript.galleryFadeSpeed, 10),
                                event: themifyScript.galleryEvent,
                                ajax_url: themifyScript.ajax_url,
                                networkError: themifyScript.networkError,
                                termSeparator: themifyScript.termSeparator
                            });
                        }
                    };
            if (!Themify.is_builder_active) {
                initGallery();
                carouselSlideshow();
            }
            else {
                $body.on('builder_load_module_partial', function (e, el, type) {
                    carouselSlideshow(el);
                    initGallery(el);
                });
            }

            // Hack Chrome browser doesn't autoplay the video background
            $body.on('themify_onepage_after_render', function () {
                // Hack Chrome browser doesn't autoplay the video background
                $.each(tbLocalScript.animationInviewSelectors, function (index, selector) {
                    $(selector).css('visibility', 'hidden');
                });
                function move_to_first_slide() {
                    var firstSlide = $(slideClass).first(),
                            first_section = firstSlide.closest(sectionClass).data('anchor');
                    $.fn.fullpage.moveTo(first_section, firstSlide.index());
                }
                // Section deep linking
                if (window.location.hash) {
                    setTimeout(function () {
                        var slideNoHashWithSlash = window.location.hash.replace(/#/, '' ).split('/'),
                            hashSlide = slideNoHashWithSlash[slideNoHashWithSlash.length-1];
                        if ('' != hashSlide && '#' != hashSlide) {
                            var $slideEl = usesRows ? $('.tb_section-' + hashSlide + ':not(' + sectionClass + ')') : $('#' + hashSlide);
                            if ($slideEl.length > 0) {
                                var section_id = $slideEl.closest(sectionClass).data('anchor');
                                $.fn.fullpage.moveTo(section_id, $slideEl.index());
                                if (typeof ThemifyBuilderModuleJs !== 'undefined' && ThemifyBuilderModuleJs.wow) {
                                    $(tbLocalScript.animationInviewSelectors).each(function (i, selector) {
                                        $(selector, $slideEl).addBack().each(function () {
                                            ThemifyBuilderModuleJs.wow.show(this);
                                        });
                                    });
                                }
                            }
                            else {
                                move_to_first_slide();
                            }
                        }
                    }, 500);
                } else {
                    move_to_first_slide();
                }
            });

            // Make row backgrounds visible.
            $('.module_row').css('visibility', 'visible');

            if( !$body.hasClass('full-section-scrolling') ){
                if ( '1' === themifyScript.pageLoaderEffect ) {
                    $('body').addClass('ready-view').removeClass('hidden-view');
            
                    $('.section_loader').fadeOut(500, function () {
                        typeof wowInit2 == "function" && wowInit2();
                    });
                }else{
                    typeof wowInit2 == "function" && wowInit2();
                }
            }else{
                $body.on('themify_onepage_after_render', function () {
                    var timeout = document.visibilityState === 'visible' ? 100 : 1000;
                    setTimeout(function () {
                        typeof wowInit2 == "function" && wowInit2();
                        ThemifyBuilderModuleJs.wow && ThemifyBuilderModuleJs.wow.stop();
                        setTimeout(function () {
                            function move_to_first_slide() {
                                var firstSlide = $(slideClass).first(),
                                        first_section = firstSlide.closest(sectionClass).data('anchor');
                                $.fn.fullpage.moveTo(first_section, firstSlide.index());
                            }
                            var slideNoHashWithSlash = window.location.hash.replace(/#/, '' ).split('/'),
                                hashSlide = slideNoHashWithSlash[slideNoHashWithSlash.length-1];
                            if ('' != hashSlide) {
                                var $slideEl = usesRows ? $('.tb_section-' + hashSlide + ':not(' + sectionClass + ')') : $('#' + hashSlide);
                                if ($slideEl.length == 0) {
                                    move_to_first_slide();
                                }
                            } else {
                                move_to_first_slide();
                            }
                            $body.addClass('ready-view').removeClass('hidden-view');
                            $('.section_loader').hide();
                        }, 500);
                    }, timeout);
                });
            }
            
            $body.on('builder_load_module_partial', function(){
                $body.addClass('ready-view').removeClass('hidden-view');
                $('.section_loader').hide();
            });

            /**
             * Called when user navigates away of the current view.
             * Publicly accessible through themifyScript.onBrowseAway
             */
            themifyScript.onBrowseAway = function (e) {

                if (e.target.activeElement.tagName === 'BODY'
                        || ($(e.target.activeElement).attr('id') === "tb_toolbar")
                        || $(e.target.activeElement).closest('#tb_toolbar').length)
                    return;
                $body.addClass('hidden-view').removeClass('ready-view');
            };

            if ('1' === themifyScript.pageLoaderEffect || $body.hasClass('full-section-scrolling')) {
                window.addEventListener('beforeunload', themifyScript.onBrowseAway);
            }
        });
    });
})(jQuery);
