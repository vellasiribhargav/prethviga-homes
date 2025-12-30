$(document).ready(function () {
    $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
    $('.upArrow').fadeIn();
    } else {
    $('.upArrow').fadeOut();
    }
    });
    $('.upArrow').on('click', function () {
    $('html, body').animate(
    { scrollTop: 0 }, 1200, 'swing'
    );
    });
    });