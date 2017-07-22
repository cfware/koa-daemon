# @cfware/koa-daemon

[![Travis CI][travis-image]][travis-url]
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

Koa Daemon Base Class

### Install @cfware/koa-daemon

```sh
npm i --save @cfware/koa-daemon
```

## Usage

```js
'use strict';

const koaDaemon = require('@cfware/koa-daemon');

class MyDaemon extends koaDaemon {
	constructor(listenAddr) {
		super(listenAddr);
		this.on('started', () => {
			console.log(`Started, listening on http://localhost:${daemon.boundAddress.port}/`);

			/* stop server and end client connections on SIGINT or SIGTERM. */
			process.on('SIGINT', () => daemon.stop());
			process.on('SIGTERM', () => daemon.stop());
		});
		this.on('stopped', () => console.log('Stopped Daemon'));
	}
	start() {
		this.app.use(ctx => ctx.body = 'Hello World!');
		super.start();
	}
}

const daemon = new MyDaemon({port: 0});
daemon.start();
```

## Running tests

Tests are provided by eslint and mocha.

```sh
npm install
npm test
```

[npm-image]: https://img.shields.io/npm/v/@cfware/koa-daemon.svg
[npm-url]: https://npmjs.org/package/@cfware/koa-daemon
[travis-image]: https://travis-ci.org/cfware/koa-daemon.svg?branch=master
[travis-url]: https://travis-ci.org/cfware/koa-daemon
[downloads-image]: https://img.shields.io/npm/dm/@cfware/koa-daemon.svg
[downloads-url]: https://npmjs.org/package/@cfware/koa-daemon
[license-image]: https://img.shields.io/github/license/cfware/koa-daemon.svg
