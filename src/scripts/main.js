/*global describe:true*/

/*
  Slidemenu
*/

// $('.handle').on('click', function() {
//     //$('nav ul').toggleClass('showing--active');

//     if ($('nav ul').hasClass('showing--active')) {
//         $('nav ul').removeClass('showing--active').addClass('showing--inactive');
//     } else {
//         $('nav ul').removeClass('showing--inactive').addClass('showing--active');
//     }

// });

var body = $('body'),
    page = body.find('.wrapper'),
    navToggle = body.find('.handle'),
    viewportHt = $(window).innerHeight();

navToggle.on('click', function() {

    body
        .removeClass('loading')
        .toggleClass('nav-open');

    if (body.hasClass('nav-open')) {
        page.css('height', viewportHt);
    } else {
        page.css('height', 'auto');
    }

});

page.find('main').on('click', function(e) {
    body.removeClass('nav-open');
    e.preventDefault();
});