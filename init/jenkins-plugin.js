var ci = require("cla/ci");

ci.createRole("Jenkins");

ci.createClass("JenkinsServer", {
    form: '/plugin/cla-jenkins-plugin/form/jenkins-server.js',
    icon: '/plugin/cla-jenkins-plugin/icon/jenkins.svg',
    roles: ["Jenkins"],
    has: {
        hostname: {
            is: "rw",
            isa: "Str",
            required: true
        },
        port: {
            is: "rw",
            isa: "Int",
            required: true
        },
        crumbEnabled: {
            is: "rw",
            isa: "Bool",
            required: true
        },
        userName: {
            is: "rw",
            isa: "Str",
            required: true
        },
        authToken: {
            is: "rw",
            isa: "Str",
            required: true
        }
    }

});

ci.createClass("JenkinsItem", {
    form: '/plugin/cla-jenkins-plugin/form/jenkins-item.js',
    icon: '/plugin/cla-jenkins-plugin/icon/jenkins.svg',
    roles: ["Jenkins"],
    has: {
        itemName: {
            is: "rw",
            isa: "Str",
            required: true
        },
        itemToken: {
            is: "rw",
            isa: "Str",
            required: false
        },
        server: {
            is: "rw",
            isa: "ArrayRef",
            required: true
        }
    }
});
