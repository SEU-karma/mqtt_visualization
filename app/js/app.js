jQuery(function ($) {
    'use strict';

    var UPDATE_INTERVAL = 10000;
    var restApiUrl = '/mqtt_demo/restful/devicestatus';
    var restApiPushUrl = '/mqtt_demo/restful/command';
    var restApiUrlDummy = 'json/data1.json';
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
            this.logTemplate = Handlebars.compile($('#log-template').html());
            this.data = [];
            this.logData = [];
            this.selectedData = '';
            this.autoReload = true;
            this.autoReloadId = 0;
            this.bindEvents();
            this.start();
        },
        bindEvents: function () {
            $('#device-info')
                .on('click', 'tr', this.select.bind(this))
                .on('change', '.toggle', this.change.bind(this));
            $('#reload-ctrl-btn').on('click', 'label', this.toggleReload.bind(this));
            $('#submit-cmd').on('click', this.pushCmd.bind(this));
        },
        start: function () {
            this.update();
        },
        update: function () {
            var self = this;
            $('#loader').spin(spinOpts);
            $.getJSON(restApiUrlDummy).then(function (results) {
                self.updateData(results);
                self.render();
                $('#loader').spin(false);
                if (self.autoReload) {
                    self.autoReloadId = setTimeout(self.update.bind(self), UPDATE_INTERVAL);
                }
            });
        },
        updateData: function (datas) {
            var self = this;
            var guids = datas.guids;
            if (_.indexOf(guids, this.selectedData) === -1) {
                this.selectedData = '';
            }
            this.data = [];
            _.each(guids, function (guid) {
                self.data.push(_.extend({guid: guid}, datas[guid]));
            });
        },
        render: function () {
            $('#device-info')
                .html(this.template(this.data))
                .find('input[value="' + this.selectedData + '"]').click();
            $('#guid-text').val(this.selectedData);
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
        },
        toggleReload: function (e) {
            var $reloadCtrl = $(e.target).find('input[type="radio"]');
            this.autoReload = $reloadCtrl.val() === 'ON';
            $('#reload-ctrl-text').text($reloadCtrl.val());
            if (this.autoReload) {
                this.update();
            } else {
                clearTimeout(this.autoReloadId);
            }
        },
        pushCmd: function (e) {
            var self = this;
            e.preventDefault();
            $('#log-loader').spin(spinOpts);
            var data = {
                guid: this.selectedData,
                callback_name: $('#callback-text').val()
            };
            $.post(restApiPushUrl, data).then(function (results) {
                self.updateLog(results);
                self.renderLog();
                $('#log-loader').spin(false);
            });
        },
        updateLog: function (result) {
            var log = {log_at: '', log_comment: ''};
            log.log_at = moment().format('YYYY-MM-DD, h:mm:ss a');
            log.log_comment = result;
            this.logData.unshift(log);
        },
        renderLog: function () {
            $('#log-info').html(this.logTemplate(this.logData));
        }
    };

    app.init();
});
