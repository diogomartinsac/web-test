/*
 *  Themify Portfolio Expander
 *  Expand Fullscreen Portfolio Content
 *  https://themify.me/themes/fullpane
 */
;(function ( $, window, document, undefined ) {

	var pluginName = "themifyPortfolioExpander",
		defaults = {
			itemContainer: '.shortcode.portfolio',
			animspeed: 700,
			animeasing: 'jswing',
			anchorLink: '.portfolio-post .post-content, .portfolio-post figure.post-image, .portfolio-post .slideshow li',
			itemSelector: '.portfolio-post',
			navigationLink: '.post-nav .prev a, .post-nav .next a',
			loader: '<div class="themify-loader">' +
						'<div class="themify-loader_1 themify-loader_blockG"></div>' +
						'<div class="themify-loader_2 themify-loader_blockG"></div>' +
						'<div class="themify-loader_3 themify-loader_blockG"></div>' +
					'</div>',
			template : '<div id="portfolio-full" class="portfolio-full">' +
							'<div class="portfolio-expanded single-portfolio">' +
							'<div class="portfolio-expand-scaler">' +
							'<iframe id="portfolio-expand-iframe" frameborder="0" allowfullscreen></iframe>' +
							'</div>' +
						'</div></div>'
		};

	function Plugin ( element, options ) {
		this.element = element;
		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			var self = this,
				$body = $('body');

			$(self.settings.template).prependTo( $body );

			// When portfolio clicked
			$(self.settings.anchorLink).on('click', function(e){
				if ( $(this).find('.porto-expand-js').length > 0 ) {
					e.preventDefault();
					var $this = $(this).find('.porto-expand-js'),
						$portfolio = $this.closest(self.settings.itemSelector),
						url = self.UpdateQueryString( 'porto_expand', 1, $this.attr('href') ),
						iframeLoaded = false;
					
					self.animateExpand( $portfolio, 'expand', true );
					
					$('#portfolio-full').show();
					$('#portfolio-expand-iframe').prop('src', url).load(function(){
						var $iframe = $(this),
							$contents = $iframe.contents();
						
						$portfolio.addClass('current-expanded');
						if ( ! iframeLoaded ) {
							$('#portfolio-full').hide().fadeIn(800).promise().done(function(){
								$(this).css('visibility', 'visible');
								$('#portfolio-clone').remove();
								$body.trigger('portfolioExpanded');
							});
						} else {
							$('#portfolio-full').css('visibility', 'visible');
							$('#portfolio-clone').remove();
							$body.trigger('portfolioExpanded');
						}

						$contents.find('.post-nav .close-portfolio').on('click', function(e){
							e.preventDefault();
							$portfolio.removeClass('current-expanded');
							self.hidePortfolio( $portfolio );
						});

						$contents.find(self.settings.navigationLink).on('click', function(e){
							e.preventDefault();
							var url = self.UpdateQueryString( 'porto_expand', 1, $(this).attr('href') );
							self.animateExpand( $portfolio, 'expand', false );
							$iframe.prop('src', url);
						});
						iframeLoaded = true;
					});
				}
			});
		},

		hidePortfolio: function( $portfolio ) {
			var self = this;
			self.animateExpand( $portfolio, 'expand', false, 'no' );

			var $clone			= $('#portfolio-clone'),
				$fullscreen = $('#portfolio-full');

			// fade in the clone
			$clone.hide().fadeIn(200)
			.promise().done(function(){
				$fullscreen.remove();
				$(self.settings.template).prependTo( $('body') );
				
				$(this).animate({
					left	: $portfolio.offset().left + 'px',
					top		: $portfolio.offset().top + 'px',
					width	: $portfolio.width() + 'px',
					height	: $portfolio.height() + 'px'
				}, self.settings.animspeed, self.settings.animeasing, function() {
					$(this).remove();
					$('body').trigger('portfolioClosed');
				});
			});
		},

		animateExpand: function( $portfolio, effect, anim, showLoader ){
			effect = effect || 'expand';
			showLoader = showLoader || 'yes';

			var	self = this,
				$clone	= $portfolio.clone()
					.removeClass('current-expanded').addClass('expanding')
					.css({
						left	: $portfolio.offset().left + 'px',
						top		: $portfolio.offset().top + 'px',
						zIndex	: 1001,
						margin	: '0px',
						height	: $portfolio.height() + 'px',
						opacity : 1
					}).attr( 'id', 'portfolio-clone' );
			
			// remove unnecessary elements from the clone
			$clone.children().remove().end();

			if (showLoader == 'yes') { 
				$clone.html(self.settings.loader);
			}
			
			// animate?
			$.fn.applyStyle = ( anim ) ? $.fn.animate : $.fn.css;
			
			var clonestyle 	= {
				width	: $(window).width() + 'px',
				height	: $(window).height() + 'px',
				left	: '0px',
				top		: $(window).scrollTop() + 'px'
			};

			var animateAction = {
				duration : self.settings.animspeed,
				easing : self.settings.animeasing,
				complete : function() {
					$(this).addClass('done');
				}
			};

			$clone.appendTo( $('body') )
			.stop().applyStyle( clonestyle, $.extend( true, [], animateAction) );
		},

		UpdateQueryString: function(a,b,c){
			c||(c=window.location.href);var d=RegExp("([?|&])"+a+"=.*?(&|#|$)(.*)","gi");if(d.test(c))return b!==void 0&&null!==b?c.replace(d,"$1"+a+"="+b+"$2$3"):c.replace(d,"$1$3").replace(/(&|\?)$/,"");if(b!==void 0&&null!==b){var e=-1!==c.indexOf("?")?"&":"?",f=c.split("#");return c=f[0]+e+a+"="+b,f[1]&&(c+="#"+f[1]),c}return c;
		}

	};

	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};

})( jQuery, window, document );