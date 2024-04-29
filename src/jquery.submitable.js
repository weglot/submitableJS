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
                this.options.defaultValues = this.computeValues();
            }
        },
        computeValues: function () {
            let values = {};
            $(this.element).find(":not([type=hidden])").each((index, element) => {
                if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
                    return;
                }
                values[element.name || index] = element.value;
            })

            return JSON.stringify(values);
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
            let enable = true;
            if (this.options.strategy === $.fn.submitable.strategy.UPDATE) {
                enable = this.computeValues() !== this.options.defaultValues;
            } else if (this.options.strategy === $.fn.submitable.strategy.NOT_EMPTY) {
                this.$element.find(":input[required]:not([type=hidden]):not([disabled]), select[required]:not([disabled]), radio:not([disabled])").each((index, element) => {
                    if (element.value === '') {
                        enable = false
                    }
                });
            }

            enable ? plugin.callback(plugin.options.onEnable) : plugin.callback(plugin.options.onDisable);
        },
        bindEvents: function () {
            let plugin = this;
            $(document).ready(function () {
                plugin.$element.on('input paste keyup change', function () {
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
        onEnable: function () {
            $.each(this.options.btn, function (index, submitSelector) {
                submitSelector.prop('disabled', false).removeClass('disabled');
            });
        },
        onDisable: function () {
            $.each(this.options.btn, function (index, submitSelector) {
                submitSelector.prop('disabled', true).addClass('disabled');
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
        onEnable: function (args) {
            this.onEnable(args);
        },
        onDisable: function (args) {
            this.onDisable(args);
        },
    }
})(jQuery, window, document);
