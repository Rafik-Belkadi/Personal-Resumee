

! function($) {
    "use strict";

    /* ---------------------------------------------- /*
    * Preloader
    /* ---------------------------------------------- */

    $(window).on('load', function() {
        $('#preloader').addClass("loaded");
        $('.line-drop').fadeOut('slow');
    });

    /* ---------------------------------------------- /*
    * Section Scroll - Navbar
    /* ---------------------------------------------- */
    
    $('.navbar-nav a').on('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 0
        }, 1500, 'easeInOutExpo');

        if($('.navbar').hasClass('active')){
            $('.navbar').removeClass('active')
            $('.ham').removeClass('active')
        }

        event.preventDefault();
    });

    $('.navbar-toggler').on('click', function(){
        $('.navbar').toggleClass('active');
        $(".ham").toggleClass('active');
    });


    /* ---------------------------------------------- /*
    * Initialize shuffle plugin
    /* ---------------------------------------------- */

    $(window).on('load', function () {


        var $portfolioContainer = $('.filter-container');

        $('#filter a').on('click', function (e) {
            e.preventDefault();

            $('#filter a').removeClass('active');
            $(this).addClass('active');

            var group = $(this).attr('data-group');
            var groupName = $(this).attr('data-group');

            $portfolioContainer.shuffle('shuffle', groupName );
        });

    });


    /* ---------------------------------------------- /*
    * Initialize imagesLoaded.js
    /* ---------------------------------------------- */

    var ImageDemo = (function($, imagesLoaded) {
    var $projectsContainer = $('.filter-container'),
        $imgs = $projectsContainer.find('img'),
        imgLoad,

    init = function() {
        imgLoad = new imagesLoaded($imgs.get());
        imgLoad.on('always', onAllImagesFinished);
    },

    onAllImagesFinished = function(instance) {
        // Adds visibility: visible;
        $projectsContainer.addClass('images-loaded');

        // Initialize shuffle
        $projectsContainer.shuffle({
            itemSelector: '.portfolio-item',
            delimeter: ' '
        });

    };

    return {
        init: init
    };

    }( jQuery, window.imagesLoaded ));

    $(document).ready(function() {
        ImageDemo.init();
    });

    /* ---------------------------------------------- /*
    * Magnific Popup - Init
    /* ---------------------------------------------- */

    $('.simple-ajax-popup').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        mainClass: 'mfp-fade',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1]
        }
    });


    /* ---------------------------------------------- /*
    * owlCarousel - Init
    /* ---------------------------------------------- */

    $("#owl-testimony").owlCarousel({
        loop:true,
        items:1,
        nav:false,
        dots: true
    });

    $('#owl-blog').owlCarousel({
        loop:true,
        items:2,
        nav:true,
        margin: 30,
        autoWidth:true,
        dots: false
    })


}(window.jQuery);

