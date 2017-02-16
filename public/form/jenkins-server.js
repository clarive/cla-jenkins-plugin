(function(params) {

    return [
        Cla.ui.textField({
            name: 'hostname',
            fieldLabel: 'Hostname or IP',
            allowBlank: false
        }),
        Cla.ui.numberField({
            name: 'port',
            fieldLabel: 'Port',
            allowBlank: false,
            maxValue: '99999',
            type: 'int',
            vtype: 	'port'
        }),
        Cla.ui.checkBox({
            name: 'crumbEnabled',
            fieldLabel: 'Crumb enabled?',
            checked:true
        }),
        Cla.ui.textField({
            name: 'userName',
            fieldLabel: 'Username',
            allowBlank: false
        }),
        Cla.ui.textField({
            name: 'authToken',
            fieldLabel: 'Authentication Token',
            allowBlank: false
        })
    ]
})