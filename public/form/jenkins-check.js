(function(params) {
    var buildNumber = Cla.ui.textField({
        name: 'buildNumber',
        value: params.data.buildNumber || '',
        fieldLabel: 'Build Number',
        allowBlank: true
    });

    var item = Cla.ui.ciCombo({
        name: 'item',
        value: params.data.item || '',
        class: 'BaselinerX::CI::JenkinsItem',
        fieldLabel: 'Jenkins Item',
        allowBlank: false,
        with_vars: 1
    });
    var timeout = Cla.ui.numberField({
        name: 'timeout',
        value: params.data.timeout || '10',
        fieldLabel: 'Timeout (seconds)',
        allowBlank: false
    });
    var checkTime = Cla.ui.numberField({
        name: 'checkTime',
        value: params.data.checkTime || '1',
        fieldLabel: 'Refresh time (seconds)',
        allowBlank: false
    });


    return [
        item,
        buildNumber,
        timeout,
        checkTime
    ]
})