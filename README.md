# Ukor

a simple build tool for Roku projects

Features:
- multiple flavors
- installation
- project and local properties
- save installation targets and authentication
- default install targets
- search for Rokus on local network
- yaml syntax properties files

## Project setup
```
/Project
- src/
  - main/
  - flavor1/
  - flavor2/
  - test/
  - testflavor1/
- ukor.properties
- ukor.local
```

### Exmaple properties (yaml)
```yaml
rokus:
  customName:
    serial: ABC123
    auth:
      user: username
      pass: password
defaults:
  roku: rokuname
  flavor: flavor1
buildDir: build
sourceDir: src
mainFlavor: main

```

## Usage
```
Usage: ukor [options] [command]


  Commands:

    make [flavors...]        Bundle your channel into a zip to the build directory
    install [flavor] [roku]  Bundle then deploy your channel to a named roku
    find                     Search for rokus on the network
    validate                 Validate ukor.properties and ukor.local
    init                     Initialize a ukor project
    test                     Install, then run test on a Roku, and receive results on http
    help [cmd]               display help for [cmd]

  Options:

    -h, --help     output usage information

    -v, --verbose  Turn on verbose logging
```
