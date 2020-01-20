/* Themify Custom Panel script to pick "sidebar-none" layout when user selects Full Section Scrolling */
(function($){

	'use strict';
	
	$(document).ready(function(){

		var $option = $('#section_full_scrolling'),
			$layoutFields = $option.closest('.themify_write_panel').find( '.themify_field-layout' ),

			$layout = $layoutFields.find( '[alt="sidebar-none"]' ).parent('a'),
			$layoutRow = $layout.closest( '.themify_field_row' ),
			
			$content = $layoutFields.find( '[alt="full_width"]' ).parent('a'),
			$contentRow = $content.closest( '.themify_field_row' ),

			$hideTitle = $('#hide_page_title'),
			$hideTitleRow = $hideTitle.closest( '.themify_field_row' ),

			$comments = $('#comment_status,#ping_status'),
			$commentsRow = $('#commentstatusdiv').find('.meta-options'),

			$rows = [ $layoutRow, $contentRow, $hideTitleRow, $commentsRow ],
			$icons = [ $layout, $content ];

		$.each( $rows, function( index, $value ) {
			$('<div class="ui-cover" style="width: 100%; height: 15%; position: absolute; z-index: 1;" />').prependTo( $value ).hide();
		});

		$option.on( 'change', function(){
			if ( 'yes' === $option.val() ) {
				$.each( $icons, function( index, $value ) {
					$value.trigger( 'click' );
				});
				$.each( $rows, function( index, $value ) {
					$value.animate({ opacity: 0.5 }, 800);
					$('.ui-cover').show();
				});
				$hideTitle.val('yes').find('[value=default],[value=no]').prop('disabled', true);
				$comments.prop('checked', false).prop('disabled', true);
			} else {
				$.each( $rows, function( index, $value ) {
					$value.animate({ opacity: 1 }, 800);
					$('.ui-cover').hide();
				});
				$hideTitle.find('[value=default],[value=no]').prop('disabled', false);
				$comments.prop('disabled', false);
			}
		} );

		if ( 'yes' === $option.val() ) {
			$.each( $icons, function( index, $value ) {
				$value.trigger( 'click' );
			});
			$.each( $rows, function( index, $value ) {
				$value.css( 'opacity', 0.5 );
				$('.ui-cover').show();
			});
			$hideTitle.val('yes').find('[value=default],[value=no]').prop('disabled', true);
			$comments.prop('checked', false).prop('disabled', true);
		}

	});

})(jQuery);