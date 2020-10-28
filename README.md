# Jenkins Plugin

<img src="https://cdn.rawgit.com/clarive/cla-jenkins-plugin/master/public/icon/jenkins.svg?sanitize=true" alt="Jenkins Plugin" title="Jenkins Plugin" width="120" height="120">

Jenkins Plugin is designed to be able to build Jenkins items or check their statuses from Clarive.

## What is Jenkins

Jenkins is a self-contained, open source automation server which can be used to automate all sorts of tasks related to building, testing, and deploying software.

Jenkins can be installed through native system packages, Docker, or even run standalone by any machine with a Java Runtime Environment (JRE) installed.

It helps to automate the non-human part of the software development process, with common things like continuous integration, making it easier for developers to integrate changes to the project, and making it easier for users to obtain a fresh build.

## Installing

To install the plugin place the cla-jenkins-plugin folder inside `CLARIVE_BASE/plugins`
directory in Clarive's instance.

### JenkinsServer Resource

To configurate the Jenkins Server Resource open:

In **Clarive SE**: Resources -> ClariveSE.

In **Clarive EE**: Resources -> Jenkins.

This Resource is to save your Jenkins Server parameters:

- **Hostname -** This is the Jenkins hostname.
- **Port -** The Jenkins server port.
- **Crumb enabled?-** This option must be checked if you have crumb activated at Jenkins security configuration.
- **User -** User for Jenkins Server.
- **Authentication Token -** Instead of user password, this plugin is using the authentification token for Jenkins connection.

Example:

		Hostname: 192.168.23.9
		Port: 8080
		Crumb enabled?: True
		User: clarive
		Authentication Token: e3jru4228ddr4g56j74dfyj

JenkinsServer Resource will also has an available service to get all Jenkins items from JenkinsServer Resource where it's been executed.

The service will add detected items to JenkinsItem CIs with the name and the server it belongs. For those items which need a token to be launched, you need to fill the token field manually in the item Resource.

### JenkinsItem Resource

To configurate the Jenkins Item Resource open:

In **Clarive SE**: Resources -> ClariveSE.

In **Clarive EE**: Resources -> Jenkins.

This Resource can be manually created, if you already have the item created in Jenkins or remotely 
create it using rule creator and the palette services designed for this plugin.
Parameters:

- **Item Name -** Name you want to set for the item.
- **Item Token -** The token to be able to build the item remotely. It can be manually asigned in Jenkins.
- **JenkinsServer -** The Jenkins Server Resource where the item is. Need to be previously created.

Example:

		Item Name: newItem
		Item Token: itemToken
		JenkinsServer: (Your Server Resource)

### Jenkins Build item

The various parameters are:

- **Jenkins item (variable name: item)** - You only need to select the Jenkins Item Resource from clarive you want to build.
- **Timeout (seconds) (variable name: timeout)** - Time for the service stop looking for the build number. 10 seconds by default. 
- **Refresh time (seconds) (variable name: check_time)** - Wait time between tries of getting build number. 1 second by default.
- **Build parameters (build_parameters)** - Here you can add parameters if your build is parameterized, or let it empty if it is not.
 
This service will return the build number asigned in Jenkins. Remember to set it in Return Key properties parameter to be able to use it later.
If any error occurs during the creation, you will be able to see the server response in the log generated into the job.

### Jenkins Check item

The various parameters are:

- **Jenkins Item (item)** - You need to select the item that you want to check.
- **Build Number (build_number)** - You can select and specific build number to check. If you let this field empty, it will take automatically the last build from the selected item. 
- **Timeout (seconds) (variable name: timeout)** - Time for the service stop looking for the build number. 10 seconds by default.
- **Refresh Time (seconds) (variable name: check_time)** - Wait time between tries of getting build number. 1 second by default.

This service will get the status and if any error occurs during the creation, you will be able to see the server response in the log generated into the job.

This service will return the selected item build result. Remember to set it in Return Key properties parameter to be able to use it later.

## How to use

### In Clarive EE

Once the plugin is placed in its folder, you can find this service in the palette in the section of generic service and can be used like any other palette op.

Configuration example for build:

```yaml
    Jenkins item: Jenkins_resource
    Timeout: 10
    Refresh time: 10
```

Configuration example for check:

```yaml
    Jenkins item: Jenkins_resource
    Timeout: 10
    Refresh time: 10
    Build Number: 12
```

### In Clarive SE

#### Rulebook

If you want to use the plugin through the Rulebook, in any `do` block, use this ops as examples to configure the different parameters:

Configuration example for build:

```yaml
do:
   - jenkins_build:
       item: 'jenkins_item_resource'     # Required. Use the mid set to the resource you created
       timeout: '10'
       check_time: '10'
       build_parameters: {
                    "param1": "value1",
                    "param2": "value2"
                }
``` 

```yaml
do:
   - jenkins_build:
       item: 'jenkins_item_resource'     # Required. Use the mid set to the resource you created
       timeout: '10'
       check_time: '10'
``` 

Configuration example for check:

```yaml
do:
   - jenkins_check:
       item: 'jenkins_item_resource'     # Required. Use the mid set to the resource you created
       timeout: '10'
       check_time: '10'
       build_number: '12'
``` 

```yaml
do:
   - jenkins_check:
       item: 'jenkins_item_resource'     # Required. Use the mid set to the resource you created
       timeout: '10'
       check_time: '10'
``` 

##### Outputs

###### Success

The service will return the console output from Jenkins API.

###### Possible configuration failures

**Task failed**

You will get the error from the console output or Jenkins API.

**Variable required**

```yaml
Error in rulebook (compile): Required argument(s) missing for op "jenkins_check": "item"
```

Make sure you have all required variables defined.

**Not allowed variable**

```yaml
Error in rulebook (compile): Argument `Server` not available for op "jenkins_build"
```

Make sure you are using the correct paramaters (make sure you are writing the variable names correctly).

## More questions?

Feel free to join **[Clarive Community](https://community.clarive.com/)** to resolve any of your doubts.
