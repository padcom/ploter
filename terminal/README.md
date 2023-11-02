# An advanced GRBL terminal

This application allows you to easily connect and manage your GRBL device.

## Usage

This is an NPM package, so you're going to need node.js and npm to run it. Consult [nodejs.org](https://nodejs.org) or better yet [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) or if you're using Windows then [nvm-for-windows](https://github.com/coreybutler/nvm-windows)

Once installed you can use it as follows:

```
Usage: npx @padcom/grbl-terminal@latest [options] <port>

An advanced GRBL terminal

Arguments:
  port                GRBL serial port to connect to

Options:
  -V, --version       output the version number
  -q, --quiet         limit output
  -b, --baud <speed>  baud rate (default: 115200) (default: 115200)
  -h, --help          display help for command

Hint: use the :help command in terminal for more
```
