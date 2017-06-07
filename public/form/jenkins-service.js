(function(params) {

    var timeoutNumberField = Cla.ui.numberField({
        name: 'timeout',
        value: '10',
        fieldLabel: 'Timeout (seconds)',
        allowBlank: false
    });
    var checkTimeNumberField = Cla.ui.numberField({
        name: 'checkTime',
        value: '1',
        fieldLabel: 'Refresh time (seconds)',
        allowBlank: false
    });

    return [
        timeoutNumberField,
        checkTimeNumberField
    ]
})