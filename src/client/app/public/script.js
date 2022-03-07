/**
 * Created by sayyedul on 9/23/16.
 */
(function ($) {
    $(document).ready(function () {

        // Sidebar Control
        $('body').append('<div class="sidebar-overlay hidden"></div>');

        $('body').on('click', '.navbar-toggle.shut', function() {
            $(this).parents('body').find('.small-sidebar').addClass('expanded');
            $(this).parents('body').find('.sidebar-overlay').removeClass('hidden');
            $(this).children('span').hide();
            $(this).children('i').removeClass('hidden');
            $(this).removeClass('shut');
            $(this).addClass('expand');
        });

        $('body').on('click', '.navbar-toggle.expand', function() {
            $(this).parents('body').find('.small-sidebar').removeClass('expanded');
            $(this).parents('body').find('.sidebar-overlay').addClass('hidden');
            $(this).children('span').show();
            $(this).children('i').addClass('hidden');
            $(this).removeClass('expand');
            $(this).addClass('shut');
        });

        $('body').on('click', '.sidebar-overlay', function() {
            $('.navbar-toggle.expand').click();
        });

        $(document).on('click', '.side-menu li', function() {
            $(this).parents('body').find('.small-sidebar').removeClass('expanded');
            $(this).parents('body').find('.navbar-toggle').children('span').show();
            $(this).parents('body').find('.navbar-toggle').children('i').addClass('hidden');
            $(this).parents('body').find('.navbar-toggle').removeClass('expand');
            $(this).parents('body').find('.navbar-toggle').addClass('shut');
            $(this).parents('body').find('.sidebar-overlay').addClass('hidden');
            $('.sidebar-overlay').addClass('hidden');
        });

        // List view and Field View control
        $('body').on('click', '#viewControl li', function() {
            var contentId = $(this).data('id');
            $(this).parents('.profile-page').find('.view-content').hide();
            $(this).parents('.profile-page').find('#' + contentId).show();
            $(this).parent().children('li').removeClass('active');
            $(this).addClass('active');
        });
    });
})(window.jQuery);
