jQuery(function ($) {
    'use strict';

    var UPDATE_INTERVAL = 10000;
    var restApiUrl1 = 'json/data1.json';
    var restApiUrl2 = 'json/data2.json';
    // var restApiUrl='https://f12w3m8f3b.execute-api.us-west-2.amazonaws.com/beta/devicestatus?nsukey=s7GXS572h2AuMjlXwBF23OeZaKe5dmOM5Dq1Pa0i01%2F2FZBGtHcV4A6tS81wMMXF2%2FKrcAVhTQW2D%2FTILVDH850TAW1lqgIJLow6iCuiOEhIEmk9csJmg9rkYrcnXQfY1BVhZHCIOqa%2BG5aBSOivSVgwdiPz%2FCxPS0W6pJCueADGbUqMx%2Bsg1hlUzlwH8N0c';
    var spinOpts = {
        lines: 13 // The number of lines to draw
        , length: 48 // The length of each line
        , width: 14 // The line thickness
        , radius: 48 // The radius of the inner circle
        , scale: 1 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#000' // #rgb or #rrggbb or array of colors
        , opacity: 0.35 // Opacity of the lines
        , rotate: 27 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1.2 // Rounds per second
        , trail: 55 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'absolute' // Element positioning
    };

    var app = {
        init: function () {
            this.template = Handlebars.compile($('#info-template').html());
            this.data = [];
            this.selectedData = '';
            this.bindEvents();
            this.start();
        },
        bindEvents: function () {
            $('#device-info').on('click', 'tr', this.select.bind(this));
            $('#device-info').on('change', '.toggle', this.change.bind(this));
        },
        start: function () {
            this.update();
        },
        update: function () {
            var self = this;
            $('#loader').spin(spinOpts);
            $.getJSON(restApiUrl1).then(function (results) {
                self.updateData(results);
                self.render();
                $('#loader').spin(false);
                setTimeout(self.update.bind(self), UPDATE_INTERVAL);
            });
        },
        updateData: function (datas) {
            var self = this;
            var guids = datas.guids;
            this.selectedData = '';
            this.data = [];
            _.each(guids, function (guid) {
                self.data.push(_.extend({guid: guid}, datas[guid]));
            });
        },
        render: function () {
            $('#guid-text').val(this.selectedData);
            $('#device-info').html(this.template(this.data));
        },
        select: function (e) {
            $(e.currentTarget).parent().find('.info').removeClass('info');
            $(e.currentTarget).addClass('info');
            $(e.currentTarget).find('input[type="radio"]').prop('checked', true).change();
        },
        change: function (e) {
            var $selected = $('#device-info').find('input[type="radio"]:checked');
            this.selectedData = $selected.val();
            $('#guid-text').val(this.selectedData);
        }
    };

    app.init();
});
