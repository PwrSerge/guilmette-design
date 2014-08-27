/*global describe:true*/

/*
  Header  -- Slide menu
*/

$(function() {
    var $page = $('.inner-wrapper'),
        $navToggle = $('.nav-toggle'),
        $mainNavigation = $('.main-navigation'),
        $header = $('.header-container'),
        $headerHt = $header.height(),
        $menuHt = $mainNavigation.height(),
        $totalmenuHt = $headerHt + $menuHt,
        $main = $('main');

    //fixed  header   on scroll
    $(window).scroll(function() {
        if ($(this).scrollTop() > 6) {

            $header.addClass("header-container-fixed");
        } else {
            $header.removeClass("header-container-fixed");
        }
    });


    // Toggle Slide Menu
    // if ($('.nav-toggle').css('display') === 'none') {
    //     console.log('test');
    //     $mainNavigation.css({
    //         '-webkit-transform': 'translateY(0)',
    //         '-ms-transform': 'translateY(0)',
    //         'transform': 'translateY(0)'
    //     });

    // } else {
    //     $mainNavigation.css({
    //         '-webkit-transform': 'translateY(-' + $menuHt + 'px)',
    //         '-ms-transform': 'translateY(-' + $menuHt + 'px)',
    //         'transform': 'translateY(-' + $menuHt + 'px)'
    //     });

    // }


    // $navToggle.on('click', function() {
    //     $page.toggleClass('open');

    //     if ($page.hasClass('open')) {
    //         $mainNavigation.css({
    //             '-webkit-transform': 'translateY(0)',
    //             '-ms-transform': 'translateY(0)',
    //             'transform': 'translateY(0)'
    //         });

    //         $('.inner-wrapper.open').css({
    //             '-webkit-transform': 'translateY(' + $menuHt + 'px)',
    //             '-ms-transform': 'translateY(' + $menuHt + 'px)',
    //             'transform': 'translateY(' + $menuHt + 'px)'
    //         });
    //     } else {
    //         $('.inner-wrapper').removeAttr('style');
    //         $mainNavigation.css({
    //             '-webkit-transform': 'translateY(-' + $menuHt + 'px)',
    //             '-ms-transform': 'translateY(-' + $menuHt + 'px)',
    //             'transform': 'translateY(-' + $menuHt + 'px)'
    //         });

    //         $('.inner-wrapper').css({
    //             '-webkit-transform': 'translateY(-' + $menuHt + 'px)',
    //             '-ms-transform': 'translateY(-' + $menuHt + 'px)',
    //             'transform': 'translateY(-' + $menuHt + 'px)'
    //         });
    //     }
    // });

    // $main.on('click', function(e) {
    //     $('.inner-wrapper').removeAttr('style');
    //     $page.removeClass('open');
    //     e.preventDefault();
    // });

});