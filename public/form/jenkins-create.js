(function(params) {

    var itemName = Cla.ui.textField({
        name: 'itemName',
        value: params.data.itemName || '',
        fieldLabel: 'Itemname',
        allowBlank: false
    });

    var server = Cla.ui.ciCombo({
        name: 'server',
        value: params.data.server || '',
        class: 'BaselinerX::CI::JenkinsServer',
        fieldLabel: 'Jenkins Server',
        allowBlank: false,
        with_vars: 1
    });

    var description = Cla.ui.textArea({
        name: 'description',
        value: params.data.description || '',
        fieldLabel: 'Item Description',
        allowBlank: true,
        height: 100
    });

    var repo = Cla.ui.ciCombo({
        name: 'repo',
        value: params.data.repo || '',
        class: ['BaselinerX::CI::GitRepository', 'BaselinerX::CI::SvnRepository', 'BaselinerX::CI::filesys_repo'],
        fieldLabel: 'Repository Server',
        allowBlank: false,
        with_vars: 1
    });
    var repUser = Cla.ui.textField({
        name: 'repUser',
        value: params.data.repUser || '',
        fieldLabel: 'Repository User',
        allowBlank: true
    });
    var branch = Cla.ui.textField({
        name: 'branch',
        value: params.data.branch || '',
        fieldLabel: 'Repository Branch',
        allowBlank: true
    });
    var repPass = Cla.ui.textField({
        name: 'repPass',
        value: params.data.repPass || '',
        fieldLabel: 'Repository Password',
        allowBlank: true
    });




    return [

        server,
        itemName,
        description,
        repo,
        branch,
        repUser,
        repPass
    ]
})