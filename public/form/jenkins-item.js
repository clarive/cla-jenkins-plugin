(function(params) {

         var serverComboBox =  Cla.ui.ciCombo({
            name: 'server',
            value: params.rec.server || '',
            class: 'JenkinsServer',
            fieldLabel: 'Jenkins Server',
            allowBlank: false
        });
        var itemNameTextField = Cla.ui.textField({
            name: 'itemName',
            fieldLabel: 'Item Name',
            allowBlank: false
        });
        var itemTokenTextField = Cla.ui.textField({
            name: 'itemToken',
            fieldLabel: 'Item Token',
            allowBlank: true
        });

    return [
        itemNameTextField,
        itemTokenTextField,  
        serverComboBox
    ]
})