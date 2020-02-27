;(function ($, window, document, undefined) {

    let pluginName = 'submitable';

    function Plugin(element, options) {
        this.element = element;
        this._name = pluginName;
        this._defaults = $.fn.submitable.defaults;
        let attributes = {};
        let arrayParams = ['btn'];

        $.each(this._defaults, function (index, value) {
            if (typeof value !== 'function') {
                let attrIndex = index.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                value = $(element).data('submitable-' + attrIndex);
                if (arrayParams.indexOf(index) !== -1 && typeof value === 'string') {
                    value = value.split(',');
                }
                attributes[index] = value;

            }
        });
        this.options = $.extend({}, this._defaults, attributes);
        this.options = $.extend({}, this.options, options);
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {
            this.buildCache();
            this.callback(this.options.before);
            this.getTriggeredButtons();
            this.getDefaultValues();
            this.changeDisabledButtons();
            this.bindEvents();
        },
        buildCache: function () {
            this.$element = $(this.element);
        },
        getDefaultValues: function () {
            if (this.options.defaultValues === '') {
                this.options.defaultValues = $(this.element).find(":not([type=hidden])").serialize();
            }
        },
        getTriggeredButtons: function () {
            if (this.options.btn.length > 0) {
                this.options.btn.forEach((element, index) => {
                    this.options.btn[index] = $(this.options.btn[index]);
                });
            } else {
                this.options.btn = [this.$element.find(':submit')];
            }
        },
        changeDisabledButtons: function () {
            let plugin = this;
            if (this.$element.find(":input:not([type=hidden])").serialize() === this.options.defaultValues) {
                plugin.callback(plugin.options.onDisable);
            } else {
                plugin.callback(plugin.options.onEnable);
            }
        },
        bindEvents: function () {
            let plugin = this;
            $(document).ready(function () {
                plugin.$element.on('input', function () {
                    plugin.changeDisabledButtons();
                });
            });

            document.body.addEventListener('onPluginLoaded', function () {
                plugin.resetDefaultsValues();
            });
        },
        resetDefaultsValues: function () {
            this.options.defaultValues = "";
            this.getDefaultValues();
        },
        callback: function (callback, args) {
            if (typeof callback === 'function') {
                callback.call(this, args);
            }
        },
        before: function (){},
        onEnable: function () {
            $.each(this.options.btn, function (index, submitSelector) {
                submitSelector.prop('disabled', false);
            });
        },
        onDisable: function () {
            $.each(this.options.btn, function (index, submitSelector) {
                submitSelector.prop('disabled', true);
            });
        }
    });

    $.fn.submitable = function (options) {
        return this.each(function () {
            let pluginInstance = $.data(this, "plugin_" + pluginName);
            if (!pluginInstance) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

    $.fn.submitable.strategy = {
        NOT_EMPTY: 'not-empty',
        UPDATE: 'update',
    };

    $.fn.submitable.defaults = {
        strategy: $.fn.submitable.strategy.UPDATE,
        btn: [],
        defaultValues: '',
        before: function (args) {
            this.before(args);
        },
        onEnable: function (args) {
            this.onEnable(args);
        },
        onDisable: function (args) {
            this.onDisable(args);
        },
    }
})(jQuery, window, document);
