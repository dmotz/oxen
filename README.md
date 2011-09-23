# oxen

create GitHub pull requests from the command line

Requires node.js and npm.

### Installation:

```bash
$ npm install -g oxen
```


### Usage (within a git repo):

```bash
$ oxen
```


### Options:

```bash
Usage: oxen.js [options]

Options:

  -h, --help     output usage information
  -v, --version  output the version number
  -m, --message  set pull request message
  -t, --title    set pull request title
  -s, --source   define a source repository url that's different than the current repository's (for forks)
  -b, --target   define target branch of your pull request (defaults to 'develop')
```


The first time you run oxen, it will ask for your GitHub info, and an optional question about the default target branch.

If your project typically pulls into a branch named "develop", setting this up will save you the trouble of typing
```bash
$ oxen -b develop
```

This is a work in progress...