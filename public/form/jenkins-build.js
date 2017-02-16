(function(params) {

    var item = Cla.ui.ciCombo({
        name: 'item',
        value: params.data.item || '',
        class: 'JenkinsItem',
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

    var buildParameters = new Baseliner.GridEditor({
        fieldLabel: _("Build Parameters"),
        width: '100%',
        height: 300,
        name: 'buildParameters',
        columns: ['name', 'value'],
        records: params.data.buildParameters,
        allowBlank: true
    });


    return [
        item,
        timeout,
        checkTime,
        buildParameters
    ]
})