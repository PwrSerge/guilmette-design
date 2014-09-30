/**
 * Guilmette-design-site - GuilmetteDesign portfolio
 * @version v1.0.1
 * @link http://www.guilmettedesign.com
 * @license ISC
 */

/*global describe:true*/
/*global Modernizr:true */


/*
  Header  -- Slide menu
*/
require('jquery') (window);


$(function() {
    var $page = $('.inner-wrapper'),
        $navToggle = $('.nav-toggle'),
        $mainNavigation = $('.nav-main '),
        $header = $('.header-container'),
        $headerHt = $header.height(),
        $menuHt = $mainNavigation.height(),
        $totalmenuHt = $headerHt + $menuHt,
        $main = $('main'),
        $root = $('html, body');

    //fixed  header  on scroll
    // $(window).scroll(function() {
    //     if ($(this).scrollTop() > 1) {
    //         $header.addClass("header-container-fixed");
    //     } else {
    //         $header.removeClass("header-container-fixed");
    //     }



    //Toggle Slide Menu

    //remove transitions on window resize
    $(window).on('resize', function() {
        if (Modernizr.mq('(min-width:500px)')) {
            $mainNavigation.removeClass('nav-activated', 'open');
        }
    });

    //Click event for sliding menu
    $navToggle.on('click', function() {
        $page.toggleClass('open').addClass('nav-activated');
        $mainNavigation.toggleClass('open').addClass('nav-activated');
    });

    $page.on('click', function(e) {
        //$('.inner-wrapper').removeAttr('style');
        $mainNavigation.removeClass('open', 'nav-activated');
        $page.removeClass('open', 'nav-activated');
        e.preventDefault();
    });

    /**
     * Smooth scrolling when clicking anchor link
     *
     */

    $("a[href*=#]").click(function() {
        var href = $.attr(this, 'href');

        if ($(".nav-toggle").css("display") === "none") {
            $root.animate({
                scrollTop: $(href).offset().top - ($headerHt + 30)
            }, 600, function() {
                window.location.hash = href;
            });

        } else {
            $root.animate({
                scrollTop: $(href).offset().top - ($totalmenuHt + 138)
            }, 600, function() {
                window.location.hash = href;
            });
        }
        return false;
    });
});