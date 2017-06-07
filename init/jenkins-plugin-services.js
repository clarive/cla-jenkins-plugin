var reg = require("cla/reg");


reg.registerCIService('getAllItems', {
    class: 'JenkinsServer',
    name: 'Get all Jenkins items',
    icon: '/plugin/cla-jenkins-plugin/icon/jenkins.svg',
    form: '/plugin/cla-jenkins-plugin/form/jenkins-service.js',
    handler: function(ctx, config) {

        var ci = require("cla/ci");
        var log = require('cla/log');
        var web = require("cla/web");
        var util = require("cla/util");

        var BASE_URL = 'http://' + this.userName() + ':' + this.authToken() + '@' + this.hostname() + ':' + this.port();
        var timeout = config.timeout || 10;
        var pause = config.checkTime || 1;
        var added = 0;
        var mid = this.mid();
        var agent = web.agent({
            auto_parse: 0,
            errors: "warn"
        });

        function getItemList(timeout, pause) {
            log.debug("Getting all Jenkins items");

            return util.retry(function() {

                var queueResponse = agent.get(BASE_URL + "/api/json");
                var content = JSON.parse(queueResponse.content)
                if (content.jobs) {
                    return content.jobs;
                }
                log.fatal("Getting all Jenkins items failed. Timeout Reached. ");
            }, {
                pause: pause,
                attempts: pause ? timeout / pause : 0
            });
        }

        var jobs = getItemList(timeout, pause);

        for (var i = 0; i < jobs.length; i++) {

            if (jobs[i]._class != "com.cloudbees.hudson.plugins.folder.Folder" && jobs[i]._class != "hudson.model.ExternalJob" && jobs[i]._class != "org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject") {

                added = 0;
                var rs = ci.find('JenkinsItem', {
                    name: jobs[i].name
                });

                rs.forEach(function(doc) {
                    if (doc.server != mid) {
                        var jenkinsNewItem = ci.getClass('JenkinsItem');
                        var jenkinsItem = new jenkinsNewItem({
                            name: jobs[i].name,
                            server: [mid],
                            itemName: jobs[i].name
                        });
                        var appMid = jenkinsItem.save();
                    }
                    added = 1
                });
                if (added == 0) {
                    var jenkinsNewItem = ci.getClass('JenkinsItem');
                    var jenkinsItem = new jenkinsNewItem({
                        name: jobs[i].name,
                        server: [mid],
                        itemName: jobs[i].name
                    });
                    var appMid = jenkinsItem.save();
                }

            }
        }

        log.info("Items added.")
    }
});


reg.register('service.jenkins.build', {
    name: 'Jenkins Item Build',
    icon: '/plugin/cla-jenkins-plugin/icon/jenkins.svg',
    form: '/plugin/cla-jenkins-plugin/form/jenkins-build.js',
    handler: function(ctx, config) {

        var ci = require("cla/ci");
        var log = require('cla/log');
        var web = require("cla/web");
        var util = require("cla/util");

        var item = config.item || "";
        var jenkinsItem = ci.findOne({
            mid: item + ''
        });
        if (!jenkinsItem) {
            log.fatal("Item CI doesn't exist");
        }
        var jenkinsServer = ci.findOne({
            mid: jenkinsItem.server + ''
        });
        if (!jenkinsServer) {
            log.fatal("Server CI doesn't exist");
        }

        var BASE_URL = 'http://' + jenkinsServer.userName + ':' + jenkinsServer.authToken + '@' + jenkinsServer.hostname + ':' + jenkinsServer.port;
        var timeout = config.timeout || 10;
        var pause = config.checkTime || 1;

        var agent = web.agent({
            auto_parse: 0,
            errors: "warn"
        });

        function waitForEmptyQueue(jobName, timeout, pause) {
            log.debug("Waiting for Jenkins empty Queue");

            return util.retry(function() {
                var queueResponse = agent.get(BASE_URL + "/job/" + jobName + "/api/json");
                var content = JSON.parse(queueResponse.content);

                if (content.inQueue == false) {
                    return content.nextBuildNumber;
                }
                log.fatal("Wait for empty queue failed. Timeout Reached. ");
            }, {
                pause: pause,
                attempts: pause ? timeout / pause : 0
            });
        }

        var jenkinsBuildNumber = waitForEmptyQueue(jenkinsItem.itemName, timeout, pause);

        log.debug("Job queue empty, nextBuildNumber=" + jenkinsBuildNumber);

        var headers = {};
        if (jenkinsServer.crumbEnabled) {
            log.debug("Getting crumb");
            var crumbResponse = agent.get(BASE_URL + '/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)');
            if (crumbResponse.success != 1) {
                log.fatal("Error getting crumb " + crumbResponse.content, crumbResponse.status + " " + crumbResponse.content)
            }
            var crumb = crumbResponse.content;
            var crumbHeader = crumb.split(':', 2);
            headers[crumbHeader[0]] = crumbHeader[1];
        }

        log.debug("Triggering build for " + jenkinsItem.itemName);

        var trigger = agent.postForm(BASE_URL + "/job/" + jenkinsItem.itemName + "/build", {
            token: jenkinsItem.itemToken,
            json: JSON.stringify({
                parameter: config.buildParameters
            })
        }, {
            headers: headers
        });

        if (trigger.status != 201) {
            log.fatal("Trigger failed");
        }

        log.info("Job " + jenkinsItem.itemName + " build " + jenkinsBuildNumber + " triggered");

        return jenkinsBuildNumber;
    }
});

reg.register('service.jenkins.check', {
    name: 'Jenkins Item Check',
    icon: '/plugin/cla-jenkins-plugin/icon/jenkins.svg',
    form: '/plugin/cla-jenkins-plugin/form/jenkins-check.js',
    handler: function(ctx, config) {
        var ci = require("cla/ci");
        var log = require('cla/log');
        var web = require("cla/web");
        var util = require("cla/util");
        var item = config.item || "";
        var jenkinsItem = ci.findOne({
            mid: item + ''
        });
        if (!jenkinsItem) {
            log.fatal("Item CI doesn't exist");
        }
        var jenkinsServer = ci.findOne({
            mid: jenkinsItem.server + ''
        });
        if (!jenkinsServer) {
            log.fatal("Server CI doesn't exist");
        }
        var BASE_URL = 'http://' + jenkinsServer.userName + ':' + jenkinsServer.authToken + '@' + jenkinsServer.hostname + ':' + jenkinsServer.port;
        var buildNumber = '';

        if (config.buildNumber == '') {
            buildNumber = 'lastBuild';
        } else {
            buildNumber = config.buildNumber || 'lastBuild';
        }
        var itemUrl = BASE_URL + "/job/" + jenkinsItem.itemName + "/" + buildNumber + "/api/json";
        var timeout = config.timeout || 10;
        var pause = config.checkTime || 1;
        var agent = web.agent({
            auto_parse: 0
        });

        function checkBuildSarted(itemUrl) {
            log.debug("Checking Item build Exists.");
            try {
                return util.retry(function() {
                    var checkBuildNumber = agent.get(itemUrl);
                    if (checkBuildNumber.success) {
                        return;
                    }
                }, {
                    pause: 1,
                    attempts: 15
                });
            } catch (e) {
                log.fatal("Error getting build number.", e);
            }
        }

        function getBuildResult(itemUrl, timeout, pause) {
            log.debug("Getting Build Result");
            return util.retry(function() {
                var checkBuildStatus = agent.get(itemUrl);
                var jenkinsResult = JSON.parse(checkBuildStatus.content).result;
                if (jenkinsResult != null) {
                    return jenkinsResult;
                } else {
                    log.fatal("Build not finished. Timeout Reached.");
                }
            }, {
                pause: pause,
                attempts: pause ? timeout / pause : 0
            });
        }

        checkBuildSarted(itemUrl);
        var jenkinsResult = getBuildResult(itemUrl, timeout, pause);
        if (!jenkinsResult) {
            log.fatal("Getting Build Result Failed. Timeout Reached. ");
        }

        log.info("Item " + jenkinsItem.itemName + " Build Number: " + buildNumber + " Result: " + jenkinsResult);
        return jenkinsResult;
    }
});