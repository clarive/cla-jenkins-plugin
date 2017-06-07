(function(params) {

    var data = params.data;

    var buildNumber = Cla.ui.textField({
        name: 'buildNumber',
        value: data.buildNumber || '',
        fieldLabel: 'Build Number',
        allowBlank: true
    });

    var item = Cla.ui.ciCombo({
        name: 'item',
        value: data.item || '',
        class: 'JenkinsItem',
        fieldLabel: 'Jenkins Item',
        allowBlank: false,
        with_vars: 1
    });
    var timeout = Cla.ui.numberField({
        name: 'timeout',
        value: data.timeout || '10',
        fieldLabel: 'Timeout (seconds)',
        allowBlank: false
    });
    var checkTime = Cla.ui.numberField({
        name: 'checkTime',
        value: data.checkTime || '1',
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