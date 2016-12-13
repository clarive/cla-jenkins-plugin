var reg = require("cla/reg");

reg.register('service.jenkins.build', {
    name: 'Jenkins Item Build',
    icon: '/plugin/cla-jenkins-plugin/icon/jenkins.svg',
    form: '/plugin/cla-jenkins-plugin/form/jenkins-build.js',
    handler: function(ctx, config) {
        var ci = require("cla/ci");
        var log = require('cla/log');
        var web = require("cla/web");
        var util = require("cla/util");

        var item = config.item || '';
        var jenkinsItem = ci.findOne({
            mid: item + ''
        });
        var jenkinsServer = ci.findOne({
            mid: jenkinsItem.server + ''
        });

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
                log.error("Wait for empty queue failed. Timeout Reached. ");
                throw new Error("Wait for empty queue failed. Timeout Reached. ");
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
                log.error("Error getting crumb " + crumbResponse.content, crumbResponse.status + " " + crumbResponse.content)
                throw new Error("Error getting crumb");
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
            log.error("Trigger failed");
            throw new Error("Trigger failed");
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
        var item = config.item || '';
        var jenkinsItem = ci.findOne({
            mid: config.item + ''
        });
        var jenkinsServer = ci.findOne({
            mid: jenkinsItem.server + ''
        });
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
            return util.retry(function() {
                var checkBuildNumber = agent.get(itemUrl);
                if (checkBuildNumber.success) {
                    return;
                }
                log.error("Error getting build number. " + checkBuildNumber.content, checkBuildNumber.status + " " + checkBuildNumber.content);
                throw new Error("Error getting build number.");
            }, {
                pause: 1,
                attempts: 15
            });

        }

        function getBuildResult(itemUrl, timeout, pause) {
            log.debug("Getting Build Result");
            return util.retry(function() {
                var checkBuildStatus = agent.get(itemUrl);
                var jenkinsResult = JSON.parse(checkBuildStatus.content).result;
                if (jenkinsResult != null) {
                    return jenkinsResult;
                }
                log.error("Getting Build Result Failed. Timeout Reached. ");
                throw new Error("Getting Build Result Failed. Timeout Reached.");
            }, {
                pause: pause,
                attempts: pause ? timeout / pause : 0
            });
        }
        checkBuildSarted(itemUrl);
        var jenkinsResult = getBuildResult(itemUrl, timeout, pause);

        log.info("Item " + jenkinsItem.itemName + " Build Number: " + buildNumber + " Result: " + jenkinsResult);
        return jenkinsResult;
    }
});