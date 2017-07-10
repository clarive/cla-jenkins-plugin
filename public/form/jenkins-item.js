(function(params) {

    var data = params.rec;

    var serverComboBox = Cla.ui.ciCombo({
        name: 'server',
        value: data.server || '',
        class: 'JenkinsServer',
        fieldLabel: _('Jenkins Server'),
        allowBlank: false
    });
    var itemNameTextField = Cla.ui.textField({
        name: 'itemName',
        fieldLabel: _('Item Name'),
        allowBlank: false
    });
    var itemTokenTextField = Cla.ui.textField({
        name: 'itemToken',
        fieldLabel: _('Item Token'),
        allowBlank: true
    });

    return [
        itemNameTextField,
        itemTokenTextField,
        serverComboBox
    ]
})