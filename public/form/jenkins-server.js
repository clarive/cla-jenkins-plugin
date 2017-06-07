(function(params) {

    var data = params.data;

    var hostnameTextField = Cla.ui.textField({
        name: 'hostname',
        fieldLabel: 'Hostname or IP',
        allowBlank: false
    });

    var portNumberField = Cla.ui.numberField({
        name: 'port',
        fieldLabel: 'Port',
        allowBlank: false,
        maxValue: '99999',
        type: 'int',
        vtype: 'port'
    });

    var crumbCheckBox = Cla.ui.checkBox({
        name: 'crumbEnabled',
        fieldLabel: 'Crumb enabled?',
        checked: true
    });

    var userNameTextField = Cla.ui.textField({
        name: 'userName',
        fieldLabel: 'Username',
        allowBlank: false
    });

    var authTokenTextfield = Cla.ui.textField({
        name: 'authToken',
        fieldLabel: 'Authentication Token',
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