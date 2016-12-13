(function(params) {

         var server =  Cla.ui.ciCombo({
            name: 'server',
            value: params.rec.server || '',
            class: 'BaselinerX::CI::JenkinsServer',
            fieldLabel: 'Jenkins Server',
            allowBlank: false
        });

    return [
        Cla.ui.textField({
            name: 'itemName',
            fieldLabel: 'Item Name',
            allowBlank: false
        }),
        Cla.ui.textField({
            name: 'itemToken',
            fieldLabel: 'Item Token',
            allowBlank: false
        }),  
       server
    ]
})