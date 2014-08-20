/*global describe:true*/

/*
  Slidemenu
*/

$(function() {
    var $page = $('.inner-wrapper'),
        $navToggle = $('.nav-toggle'),
        $mainNavigation = $('.main-navigation'),
        $menuHt = $mainNavigation.height(),
        $main = $('main');

    $mainNavigation.css({
        '-webkit-transform': 'translateY(-' + $menuHt + 'px)',
        '-ms-transform': 'translateY(-' + $menuHt + 'px)',
        'transform': 'translateY(-' + $menuHt + 'px)'
    });

    $navToggle.on('click', function() {
        $page.toggleClass('open');
        if ($page.hasClass('open')) {
            $('.inner-wrapper.open').css({
                '-webkit-transform': 'translateY(' + $menuHt + 'px)',
                '-ms-transform': 'translateY(' + $menuHt + 'px)',
                'transform': 'translateY(' + $menuHt + 'px)'
            });
        } else {
            $('.inner-wrapper').removeAttr('style');
        }
    });

    $main.on('click', function(e) {
        $('.inner-wrapper').removeAttr('style');
        $page.removeClass('open');
        e.preventDefault();
    });

});