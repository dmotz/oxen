#!/usr/bin/env node

/**
 * oxen
 * create GitHub pull requests from the command line
 * Dan Motzenbecker <motzdc@gmail.com>
 * MIT License
 */

var https = require('https'),
    fs    = require('fs'),
    exec  = require('child_process').exec,
    qs    = require('querystring'),
    oxen  = require('commander'),
    currentDir,
    homeDir,
    username,
    password,
    ghRemote,
    target,
    defaultTarget,
    branch;
    
oxen
    .version('0.0.2')
    .option('-m, --message [message]', 'set pull request message')
    .option('-t, --title [title]', 'set pull request title')
    .option('-s, --source [name]', 'define a source repository url that\'s '
        + 'different than the current repository\'s (for forks)')
    .option('-b, --target [name]', 'define target branch of your pull request '
        + '(defaults to \'master\')')
    .option('-r, --reset', 'reset GitHub credentials if you need to change them')
    .parse(process.argv);


function handleError(stderr){
    if(stderr !== ''){
        console.error('\x1b[31m' + stderr + '\x1b[0m');
    }else{
        console.error('\x1b[31msomething went wrong here...\x1b[0m');
    }
    process.exit(1)
}

function getBranch(cb){
    var cmd = exec('git name-rev --name-only HEAD', function(err, stdout, stderr){
        (err || stderr !== '') && handleError(stderr);
        cb(trim(stdout));
    });
}

function getRemote(cb){
    var cmd = exec('git remote show origin -n', function(err, stdout, stderr){
        (err || stderr !== '') && handleError(stderr);
        var output = stdout.split('\n'),
            path = output[2].match(/github\.com\:.+/)[0].slice(11).replace(/\.git$/, '');
        cb(path);
    });
}

function submitRequest(){    
    var title = oxen.title || branch + ' -> ' + target,
        body  = oxen.message || '';
    
    var postData = {
        'pull[base]' : target,
        'pull[head]' : branch,
        'pull[title]': title,
        'pull[body]' : body
    }
        
    postData = qs.stringify(postData);
    
    var options = {
        host : 'github.com',
        port : 443,
        path : '/api/v2/json/pulls/' + ghRemote,
        method : 'POST',
        headers : {
            'Authorization'  : 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
            'Content-Type'   : 'application/x-www-form-urlencoded',
            'Content-Length' : postData.length
        }
    }

    var req = https.request(options, function(res){
        res.setEncoding('utf-8');
        var data = '';
        res.on('data', function(chunk){
            data += chunk;
        });
        res.on('end', function(){
            try{
                var obj = JSON.parse(data);
            }catch(e){
                console.error('hit a bump in the road: \x1b[31m' + e + '\x1b[0m');
                process.exit(1);
            }
            if(obj.error){
                console.error('hit a bump in the road: \x1b[31m' + obj.error + '\x1b[0m');
                process.exit(1);
            }
        });
    });
    req.write(postData);
    req.end();
    req.on('error', function(e){
        console.error('hit a bump in the road: \x1b[31m' + e + '\x1b[0m');
        process.exit(1);
    });
}

function confirmPull(){
    oxen.confirm('pull request ' + branch + ' into ' + target + '? ', function(ok){
        process.stdin.destroy();
        if(!ok){
            process.exit();
        }
        submitRequest();
    });
}

function trim(str){
    return str.replace(/\n/g, '');
}

function getHomeDir(cb){
    var cmd = exec('echo $HOME', function(err, stdout, stderr){
        homeDir = trim(stdout);
        process.chdir(homeDir);
        cb();
    });
}

function setUp(){
    console.log('\nLooks like this is your first time using oxen.');
    console.log('Before you start, you\'ll have to setup your GitHub username and password.\n');
    oxen.prompt('username: ', function(u){
        username = u;
        oxen.password('password: ', '*', function(p){
            password = p;
            oxen.prompt('default target branch (optional, defaults to master): ', function(d){
                defaultTarget = trim(d);
                defaultTarget = defaultTarget ? defaultTarget : 'master';
                var options = { 
                                username      : trim(username),
                                password      : trim(password),
                                defaultTarget : defaultTarget
                            }
                fs.writeFile('.oxen', JSON.stringify(options), function(err){
                    if(err){
                        console.error(err);
                        process.exit(1);
                    }
                    init(options);
                });
            });
        });
    });
}

function init(config){
    username = config.username;
    password = config.password;
    defaultTarget = config.defaultTarget;
    process.chdir(currentDir);
    getBranch(function(b){
        branch = b;

        if(!oxen.target){
            target = config.defaultTarget;
        }else{
            target = oxen.target;
        }

        if(!oxen.source){
            getRemote(function(r){
                ghRemote = r;
                confirmPull();
            });
        }else{
            ghRemote = oxen.source;
            confirmPull();
        } 
    });
}

currentDir = process.cwd();
getHomeDir(function(){
    if(oxen.reset){
        setUp();
    }else{
        fs.readFile('.oxen', function(err, data){
            if(err){
                setUp();
            }else{
                try{
                    var config = JSON.parse(data);
                }catch(e){
                    setUp();
                    return;
                }
                init(config);
            }
        });
    }
});