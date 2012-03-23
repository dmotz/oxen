# oxen

create GitHub pull requests from the command line

Requires node.js and npm.

### Installation:

```
$ npm install -g oxen
```


### Usage (within a git repo):

```
$ oxen
```


### Options:

```
Usage: oxen [options]

Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -m, --message [message]  set pull request message
    -t, --title [title]      set pull request title
    -s, --source [name]      define a source repository url that's different than the current repository's source (for forks)
    -b, --branch [name]      define target branch of your pull request (defaults to 'master')
    -r, --reset              reset GitHub credentials if you need to change them

```


The first time you run oxen, it will ask for your GitHub info, and an optional question about the default target branch.

If your project typically pulls into a branch named "develop", setting this up will save you the trouble of typing

```
$ oxen -b develop
```

This is a work in progress... Feel free to fork and improve.
