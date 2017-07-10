(function(params) {

    var data = params.data;

    var hostnameTextField = Cla.ui.textField({
        name: 'hostname',
        fieldLabel: _('Hostname or IP'),
        allowBlank: false
    });

    var portNumberField = Cla.ui.numberField({
        name: 'port',
        fieldLabel: _('Port'),
        allowBlank: false,
        maxValue: '99999',
        type: 'int',
        vtype: 'port'
    });

    var crumbCheckBox = Cla.ui.checkBox({
        name: 'crumbEnabled',
        fieldLabel: _('Crumb enabled?'),
        checked: true
    });

    var userNameTextField = Cla.ui.textField({
        name: 'userName',
        fieldLabel: _('Username'),
        allowBlank: false
    });

    var authTokenTextfield = Cla.ui.textField({
        name: 'authToken',
        fieldLabel: _('Authentication Token'),
        allowBlank: false
    });

    return [
        hostnameTextField,
        portNumberField,
        crumbCheckBox,
        userNameTextField,
        authTokenTextfield
    ]
})