(function(params) {

         var server =  Cla.ui.ciCombo({
            name: 'server',
            value: params.rec.server || '',
            class: 'BaselinerX::CI::JenkinsServer',
            fieldLabel: 'Jenkins Server',
            allowBlank: false
        });

         var repo = Cla.ui.ciCombo({
            name: 'repo',
            value: params.rec.repo || '',
            class: ['BaselinerX::CI::GitRepository', 'BaselinerX::CI::SvnRepository', 'BaselinerX::CI::filesys_repo'],
            fieldLabel: 'Repository Server',
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
        
       server,
       repo,
       Cla.ui.textField({
        name: 'branch',
        fieldLabel: 'Repository Branch',
        allowBlank: true
        }),
        Cla.ui.textField({
            name: 'userId',
            fieldLabel: 'Jenkins Credential ID for Repository',
            allowBlank: true
        })

    ]
})