/**
 * Themify Section Highlight
 * Copyright (c) Themify
 */
;
(function ( $, window, document, undefined ) {

	var pluginName = "themifySectionHighlight",
		defaults = {
			speed: 1500
		};

	function Plugin( element, options ) {
		this.element = element;
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this.onClicking = false;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			var self = this,
				sections = [],
				$mainNavLink = $( 'a', $( '#main-nav' ) );

			// collects position scrollto
			$mainNavLink.each( function () {
				var url = $( this ).attr( 'href' );
				if ( 'undefined' != typeof(url) && url.indexOf( '#' ) != - 1 && url.length > 1 ) {
					sections.push( $( this ).prop( 'hash' ) );
				}
			});
			sections.push( '#header' );

			// Setup scroll event
			var didScroll = false;
			$(window).scroll(function() {
				didScroll = true;
			});
			setInterval(function() {
				if ( didScroll ) {
					didScroll = false;
					self.doScroll( sections );
				}
			}, 250);
		},

		isTouchDevice: function () {
			try {
				document.createEvent( 'TouchEvent' );
				return true;
			} catch ( e ) {
				return false;
			}
		},

		clearHash: function () {
			// remove hash
			if ( window.history && window.history.replaceState ) {
				window.history.replaceState( '', '', window.location.pathname );
			} else {
				window.location.href = window.location.href.replace( /#.*$/, '#' );
			}
		},

		changeHash: function ( href ) {
			if ( 'replaceState' in history ) {
				history.replaceState( null, null, href );
			} else {
				window.location.hash = href;
			}
		},

		isInViewport: function( obj ) {
			var $t = $(obj);
			if ( 'undefined' === typeof $t.offset() ) {
				return false;
			}
			var $window = $(window),
				windowHeight = $window.height(),
				windowTop = $window.scrollTop(),
				// Divided by X to tell it's visible when the section is half way into viewport
				windowBottom = windowTop + (windowHeight/4),
				eleTop = $t.offset().top,
				eleBottom = eleTop + $t.height();
			return ((eleTop <= windowBottom) && (eleBottom >= windowTop));
		},

		doScroll: function( sections ) {
			if ( sections.length > 0 ) {
				var self = this,
					href = '';
				$.each( sections, function ( index, value ) {
					if ( $( value ).length > 0 && self.isInViewport( value ) ) {
						href = value;
					}
				});
				if ( '#' != href && href != window.location.hash ) {
					// Highlight link
					$( 'a[href*="' + href + '"]' ).parent( 'li' ).addClass( 'current_page_item' )
					.siblings().removeClass( 'current_page_item current-menu-item' );

					// Change URL hash
					self.changeHash( href );

					// remove hash if header
					if ( href.replace( '#', '' ) == 'header' ) {
						self.clearHash();
						$( 'a', $( '#main-nav' ) ).parent( 'li' ).siblings().removeClass( 'current_page_item current-menu-item' );
					}
				}
			}
		}
	};

	$.fn[pluginName] = function ( options ) {
		return this.each( function () {
			if ( ! $.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};

})( jQuery, window, document );