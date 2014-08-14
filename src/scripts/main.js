/*global describe:true*/

/*
  Slidemenu
*/

$('.handle').on('click', function() {
    //$('nav ul').toggleClass('showing--active');

    if ($('nav').hasClass('showing--inactive')) {
        $('nav').removeClass('showing--inactive');
        $('nav').find('ul').addClass('showing--active');
    } else {
        $('nav').find('ul').removeClass('showing--active');
        $('nav').addClass('showing--inactive');
    }

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