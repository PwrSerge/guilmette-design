/*global describe:true*/

/*
  Slidemenu
*/

$(function() {
    $('.nav-toggle').on('click', function() {
        $('.inner-wrapper').toggleClass('open');
    });
});
// var body = $('body'),
//     page = body.find('.wrapper'),
//     navToggle = body.find('.handle'),
//     viewportHt = $(window).innerHeight();

// navToggle.on('click', function() {

//     body
//         .removeClass('loading')
//         .toggleClass('nav-open');

//     if (body.hasClass('nav-open')) {
//         page.css('height', viewportHt);
//     } else {
//         page.css('height', 'auto');
//     }

// });

// page.find('main').on('click', function(e) {
//     body.removeClass('nav-open');
//     e.preventDefault();
// });