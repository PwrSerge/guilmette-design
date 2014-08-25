/*global describe:true*/

/*
  Slidemenu
*/

$(function() {
    var $page = $('.inner-wrapper'),
        $navToggle = $('.nav-toggle'),
        $mainNavigation = $('.main-navigation'),
        $header = $('.main-navigation'),
        $headerHt = $header.height(),
        $menuHt = $mainNavigation.height(),
        $totalmenuHt = $headerHt - $menuHt,
        $main = $('main');

    // $mainNavigation.css({
    //     '-webkit-transform': 'translateY(-' + $menuHt + 'px)',
    //     '-ms-transform': 'translateY(-' + $menuHt + 'px)',
    //     'transform': 'translateY(-' + $menuHt + 'px)'
    // });
    // if ($('.nav-toggle').css('display') === 'none') {
    //     $('.inner-wrapper').css({
    //         '-webkit-transform': 'translateY(' + $headerHt + 'px)',
    //         '-ms-transform': 'translateY(' + $headerHt + 'px)',
    //         'transform': 'translateY(' + $headerHt + 'px)'
    //     });
    // }




    $navToggle.on('click', function() {
        $page.toggleClass('open');

        if ($page.hasClass('open')) {
            $mainNavigation.css({
                '-webkit-transform': 'translateY(' + $menuHt + 'px)',
                '-ms-transform': 'translateY(' + $menuHt + 'px)',
                'transform': 'translateY(' + $menuHt + 'px)'
            });


            $('.inner-wrapper.open').css({
                '-webkit-transform': 'translateY(' + $menuHt + 'px)',
                '-ms-transform': 'translateY(' + $menuHt + 'px)',
                'transform': 'translateY(' + $menuHt + 'px)'
            });
        } else {
            $('.inner-wrapper').removeAttr('style');
            $mainNavigation.css({
                '-webkit-transform': 'translateY(-' + $menuHt + 'px)',
                '-ms-transform': 'translateY(-' + $menuHt + 'px)',
                'transform': 'translateY(-' + $menuHt + 'px)'
            });
            // $('.inner-wrapper').css({
            //     '-webkit-transform': 'translateY(-' + $totalmenuHt + 'px)',
            //     '-ms-transform': 'translateY(-' + $totalmenuHt + 'px)',
            //     'transform': 'translateY(-' + $totalmenuHt + 'px)'
            // });
        }
    });

    $main.on('click', function(e) {
        $('.inner-wrapper').removeAttr('style');
        $page.removeClass('open');
        e.preventDefault();
    });

});