---
title: Jenkins Plugin
icon: page
---

# Jenkins Plugin

Jenkins Plugin is designed to be able to configurate new items, build them or check their
statuses from Clarive.

## What is Jenkins

Jenkins is an open source automation server written in Java.

It helps to automate the non-human part of the software development process, with common things like continuous integration, making it easier for developers to integrate changes to the project, and making it easier for users to obtain a fresh build.

## Installing

To install the plugin place the cla-jenkins-plugin folder inside `CLARIVE_BASE/plugins`
directory in Clarive's platform.

## How to use

Once the plugin is placed in its folder, you can start using it going to your Clarive's
instance.

After restarting your Clarive's instance, you will have two new CIs:

### JenkinsServer:

This CI is to save your Jenkins Server parameters:

- **Hostname -** This is the Jenkins hostname.
- **Port -** The Jenkins server port.
- **User -** User for Jenkins Server.
- **Authentification Token -** Instead of user password, this plugin is using the authentification token for Jenkins connection.

Example:

```javascript
Hostname: 192.168.23.9
Port: 8080
User: clarive
Authentification Token: e3jru4228ddr4g56j74dfyj
```

### JenkinsItem:

This CI can be manually created, if you already have the item created in Jenkins or remotely 
create it using rule creator and the palette services designed for this plugin.
Parameters:

- **Item Name -** Name you want to set for the item.
- **Item Token -** The token to be able to build the item remotely. It can be manually asigned in Jenkins or automatically with the palette item.
- **Description -** Optional description for the item.
- **JenkinsServer -** The Jenkins Server CI where the item is. Need to be previously created.
- **Repository -** Like with Jenkins Server, you need to have a [Git](http://docs.clarive.com/setup/operation/#artifacts-and-repositories) or [Svn](http://docs.clarive.com/setup/operation/#artifacts-and-repositories) repository CI that the item will be using and building.
- **Repository Branch -** This is optional, just fill it if the repository needs an specific branch to use. Empty value means any brach.
- **Repository User ID -** This is optional, just in case your repository needs an user and password, Jenkins asign an ID when it creates the credentials.

Example:

```javascript
Item Name: newItem
Item Token: itemToken
Description: some text
JenkinsServer: (Your Server CI)
Repository: (Your Repository CI)
Repository Branch: master
Repository User ID: (the ID asigned in Jenkins to the repository user)
```

## Palette Services:

### Jenkins Create new Item

This palette service will let you be able to configurate a new item to be created in Jenkins remotely.
Parameters:

- **Item Name -** You will need to fill an itemname with the name you want for the new item.
- **Description -** Optional description of the item.
- **Jenkins Server -** You need to have a JenkinsServer CI previously created.
- **Repository -** Like with Jenkins Server, you need to have a [Git](http://docs.clarive.com/setup/operation/#artifacts-and-repositories) or [Svn](http://docs.clarive.com/setup/operation/#artifacts-and-repositories) repository CI previously created.
- **Repository Branch -** This is optional, just fill it if the repository needs an specific branch to use.
- **Repository User -** This is optional, just fill it if the repository needs an user and password.
- **Repository Password -** This is optional, just fill it if the repository needs an user and password.

This service will check the connection to the selected Jenkins Server and will try to create the item you
filled in the parameters. If any error occurs during the creation, you will be able to see the server response in the log generated into the job.

This service will return the Item ID asigned in Clarive to JenkinsItem CI. Remember to set it in Return Key properties parameter to be able to use it later.


### Jenkins Build item

This palette service will remotely build the item you select from JenkinsItem CI, returning the build number the item will have in Jenkins.
Parameters:

- **Jenkins Item -** You only need to select the Jenkins Item CI from clarive you want to build.
- **Timeout (seconds) -** Time for the service stop looking for the build number. 10 seconds by default. 
- **Refresh Time (seconds)-** Wait time between tries of getting build number. 1 second by default.
 
This service will return the build number asigned in Jenkins. Remember to set it in Return Key properties parameter to be able to use it later.
If any error occurs during the creation, you will be able to see the server response in the log generated into the job.

### Jenkins Check item

This palette will get the status of an specific build number from an item.
Parameters:

- **Jenkins Item -** You need to select the item that you want to check.
- **Build Number -** You can select and specific build number to check. If you let this field empty, it will take automatically the last build from the selected item. 
- **Timeout (seconds) -** Time for the service stop looking for the build number. 10 seconds by default.
- **Refresh Time (seconds)-** Wait time between tries of getting build number. 1 second by default.

This service will get the status and if any error occurs during the creation, you will be able to see the server response in the log generated into the job.

This service will return the selected item build result. Remember to set it in Return Key properties parameter to be able to use it later.


## Variables:

In order to use some comboboxes options from some services, you will need to use variables created in the Variable CI's from Clarive as you will not be able to manually write them into the combobox.

The most important variable to be used will be the JenkinsMid, which return the Jenkins Item CI Mid to be used in the next service in a combobox.
This CI variable must be created with the following parameters:

- **Type -** CI. 
- **CI Role -** All. 
- **CI CLASS -** select the specific CI Class it will use, in this case is the JenkinsItem CI class.

Once you create it in the Variables Class, you will be able to see it in the comboboxes and use it when you want.

You can create more variables if you are gonna need them into other comboboxes which doesn't allow you to write the variable you want to use on the same way you created the JenkinMid variable.



