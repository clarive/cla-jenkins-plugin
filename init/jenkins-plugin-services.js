var reg = require("cla/reg");

reg.register('service.jenkins.create', {
    name: 'Jenkins Create new Item',
    icon: '/plugin/cla-jenkins-plugin/icon/jenkins.svg',
    form: '/plugin/cla-jenkins-plugin/form/jenkins-create.js',
    handler: function(ctx, config) {

        var ci = require("cla/ci");
        var digest = require("cla/digest");
        var fs = require('cla/fs');
        var hs = require('handlebars');
        var proc = require("cla/process");
        var log = require('cla/log');
        var web = require("cla/web");

        var CLARIVE_BASE = proc.env('CLARIVE_BASE');
        var server = config.server || '';
        var repo = config.repo || '';
        var jenkinsServer = ci.findOne({
            mid: server + ''
        });
        var jenkinsRepo = ci.findOne({
            mid: repo + ''
        });
        var repUser = config.repUser || '';
        var repPass = config.repPass || '';
        var branch = config.branch || '';
        var description = config.description || '';
        var itemName = config.itemName || '';
        var BASE_URL = 'http://' + jenkinsServer.userName + ':' + jenkinsServer.authToken + '@' + jenkinsServer.hostname + ':' + jenkinsServer.port;
        var TEMPLATE_PATH = CLARIVE_BASE + "/plugins/cla-jenkins-plugin/templates/";

        function createNewItem(crumb, xmlLocation, json, itemName) {

            var localhost = ci.getClass('GenericServer');
            var local = new localhost({
                name: "localhost",
                hostname: "localhost"
            });
            var agent = local.connect();
            if (userId != '') {
                var createCredential = 'curl -H ' + crumb + " -s POST '" + BASE_URL + "/credentials/store/system/domain/_/createCredentials'" + " --data-urlencode " + json;
                agent.execute(createCredential);
                if (agent.tuple().rc != 0) {
                    throw new Error("Error creating Credentials " + agent.tuple().output);
                }
            }

            var createJob = 'curl -H ' + crumb + " -s POST '" + BASE_URL + "/createItem?name=" + itemName + "'" + " --data-binary @" + xmlLocation + ' -H "Content-Type:text/xml"';
            agent.execute(createJob);
            fs.deleteFile(xmlLocation);
            if (agent.tuple().rc != 0) {
                throw new Error("Error creating Item " + agent.tuple().output);
            }
        };

        var createCI = function(itemName, description, repo, branch, server, userId) {

            var ag = web.agent();
            var checkItem = ag.get(BASE_URL + "/job/" + itemName + "/");

            if (checkItem.isSuccess()) {
                var JenkinsItem = ci.getClass('JenkinsItem');
                var token = digest.md5(itemName);
                var item = new JenkinsItem({
                    name: itemName,
                    itemName: itemName,
                    itemToken: token,
                    description: description,
                    repo: [repo],
                    branch: branch,
                    server: [server],
                    userId: userId
                });
                var jenkinsMid = item.save();
                log.info("This is done. Item " + itemName + " Created with mid: " + jenkinsMid, "Clarive item MID: " + jenkinsMid +
                    "\r\nItem Name: " + itemName + "\r\noutput: " + checkItem.code() + ' ' + checkItem.message());
                return jenkinsMid;

            } else {
                log.error("Item Creation Failed ", checkItem.code() + ' ' + checkItem.message() + '\r\n' + checkItem.content());
                throw new Error("Item Creation Failed ");
            }

        };

        var buildXml = function(repo, branch, description, itemName, userId) {

            var repoTemplate;
            var repoCompiled;
            var repoTpl;
            var xmlDir = TEMPLATE_PATH + "config.xml";

            if (repo.collection == 'GitRepository') {
                repoTemplate = fs.slurp(TEMPLATE_PATH + "git.tpl");
                repoCompiled = hs.compile(repoTemplate);
                repoTpl = repoCompiled({
                    repoDir: repo.repo_dir,
                    branch: '*/' + branch,
                    userId: userId
                });

            } else if (repo.collection == 'SvnRepository') {
                repoTemplate = fs.slurp(TEMPLATE_PATH + "svn.tpl");
                repoCompiled = hs.compile(repoTemplate);
                repoTpl = repoCompiled({
                    repoDir: repo.repo_dir,
                    userId: userId
                });

            } else {
                repoTpl = '';
                log.error("ERROR. Not a Git or SVN repository ", "Repository Type: " + repo.collection);
                throw new Error("ERROR. Not a Git or SVN repository ");

            }

            var xmlTemplate = fs.slurp(TEMPLATE_PATH + "xml.tpl");
            var xmlCompiledTemplate = hs.compile(xmlTemplate);
            var xml = xmlCompiledTemplate({
                description: description,
                repoTpl: repoTpl,
                itemToken: digest.md5(itemName)
            });
            fs.createFile(xmlDir, xml);
            return xmlDir;
        };

        var userId = '';

        if (repUser == '' && repPass == '') {
            userId = '';

        } else {
            userId = digest.md5(config.repUser + config.repPass);

        }

        var jsonTemplate = fs.slurp(TEMPLATE_PATH + "credential.tpl");
        var jsonCompiledTemplate = hs.compile(jsonTemplate);
        var json = jsonCompiledTemplate({
            userId: userId,
            repUser: repUser,
            repPass: repPass
        });

        var ag = web.agent();
        var getCrumb = ag.get(BASE_URL + '/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)');
        var crumb = getCrumb.content();

        if (getCrumb.isSuccess()) {
            var existingItem = ag.get(BASE_URL + "/job/" + itemName + "/");

            if (existingItem.isSuccess() == '') {
                var xmlLocation = buildXml(jenkinsRepo, branch, description, itemName, userId);
                createNewItem(crumb, xmlLocation, json, itemName);
                return createCI(itemName, description, repo, branch, server, userId);

            } else {
                log.error("Item Name Already Exists in Jenkins ", existingItem.code() + ' ' + existingItem.message() + ' \r\n' + itemName);
                throw new Error("Item Name Already Exists in Jenkins ");

            }
        } else {
            log.error("Request Failed ", 'Request Failed ' + getCrumb.code() + ' ' + getCrumb.message());
            throw new Error("Request Failed ");

        }
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
        var waited = 0;
        var ag = web.agent();
        var getQeueItem = ag.get(BASE_URL + "/job/" + jenkinsItem.itemName + "/build?token=" + jenkinsItem.itemToken);

        if (getQeueItem.isSuccess()) {
            var location = getQeueItem.header('location');
            var index = location.lastIndexOf('item/')
            var qeueNumber = location.substring(index + 5, location.length - 1)

            while (1) {
                var jenkinsBuildNumber;

                try {
                    var getNumber = ag.get(BASE_URL + "/queue/item/" + qeueNumber + "/api/json");
                    var resJson = JSON.parse(getNumber.content());
                    jenkinsBuildNumber = resJson.executable.number;

                } catch (e) {

                }
                if (jenkinsBuildNumber) {
                    break;

                } else if (timeout) {
                    util.sleep(pause);
                    waited += pause;

                    if (waited >= timeout) {
                        break;
                    }
                }
            }

            if (waited >= timeout) {
                log.error("Build Failed. Timeout to get build number reached ");
                throw new Error("Build Failed. Timeout to get build number reached ")

            }
            log.info("Item " + jenkinsItem.itemName + " Build Number " + jenkinsBuildNumber, getNumber);
            return jenkinsBuildNumber;

        } else {
            log.error("Build Request Failed ", existingItem.code() + ' ' + existingItem.message() + ' ' + jenkinsItem.itemName);
            throw new Error("Build Request Failed ");
        }
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
        var ag = web.agent();
        var checkNumber = ag.get(itemUrl);
        var resJson;

        if (checkNumber.isSuccess()) {
            var timeout = config.timeout;
            var pause = config.checkTime;
            var waited = 0;

            while (1) {
                var jenkinsResult;

                try {
                    checkNumber = ag.get(itemUrl);
                    resJson = JSON.parse(checkNumber.content());
                    jenkinsResult = resJson.result;

                } catch (e) {

                }
                if (jenkinsResult != null) {
                    break;

                } else if (timeout) {
                    util.sleep(pause);
                    waited += pause;

                    if (waited >= timeout) {
                        break;
                    }
                }
            }

            if (waited >= timeout) {
                throw new Error("Check failed. Timeout reached")
            }

            log.info("Item " + jenkinsItem.itemName + " Build Number: " + buildNumber + " Result: " + jenkinsResult, checkNumber);
            return jenkinsResult;

        } else {
            log.error("Check Request failed ", checkNumber.code() + ' ' + checkNumber.message(), " Request failed ", checkNumber.code() + ' ' + checkNumber.message());
            throw new Error("Check Request failed ", checkNumber.code() + ' ' + checkNumber.message());
        }
    }
});