'use strict';

const assert = require('assert');
const koaDaemon = require('..');
const http = require('http');

class testDaemon extends koaDaemon {
	constructor(listenAddr) {
		super(listenAddr);
		this.total = 0;
		this.started = 0;
		this.stopping = 0;
		this.stopped = 0;
		this
			.on('started', () => {
				this.bumpField('started');
				this.url = `http://localhost:${this.boundAddress.port}/`;
				assert.equal(this.total, 1, 'data.total');
				assert.equal(this.started, 1, 'data.started');
			})
			.on('stopping', () => {
				this.bumpField('stopping');
				assert.equal(this.total, 2, 'data.total');
				assert.equal(this.started, 1, 'data.started');
				assert.equal(this.stopping, 1, 'data.stopping');
			})
			.on('stopped', () => {
				this.bumpField('stopped');
				assert.equal(this.total, 3, 'data.total');
				assert.equal(this.started, 1, 'data.started');
				assert.equal(this.stopping, 1, 'data.stopping');
				assert.equal(this.stopped, 1, 'data.stopped');
			});
	}
	bumpField(field) {
		this.total += 1;
		this[field] += 1;
	}
	doHttpRequest() {
		assert.equal(this.connections, 0, 'no active connections');

		http.get(this.url, res => {
			let data = '';

			res.on('data', chunk => data += chunk);
			res.on('end', () => {
				assert.equal('test', data);
				this.stop(false);
			});

			assert.equal(200, res.statusCode);
		});
	}
	doHttpTimeout() {
		const socket = http.get(this.url, () => {});
		socket.on('error', () => {});

		let interval = setInterval(() => {
			if (this.connections === 1) {
				interval = clearInterval(interval);
				this.stop(false);
			}
		}, 1);
	}
}

/* global describe: true, it: true */
describe('@cfware/koa-daemon', () => {
	it('listenAddr is missing', () => assert.throws(() => new koaDaemon(), Error));

	it('invalid listenAddr throws', () => {
		const daemon = new testDaemon({});

		assert.notEqual(daemon, null, 'daemon is not null');
		assert.equal(daemon.connections, 0, 'daemon has no connections');
		assert.throws(() => daemon.start(), Error, 'cannot start with invalid listenAddr');
		assert.equal(daemon.total, 0);
	});

	it('double start throws', function(done) {
		const daemon = new testDaemon({port: 0});

		daemon.start();
		assert.throws(() => daemon.start(), Error);
		daemon.on('started', () => daemon.stop());
		daemon.on('stopped', () => done());
	});

	it('stop after response', function(done) {
		const daemon = new testDaemon({port: 0});

		daemon
			.on('started', () => daemon.doHttpRequest())
			.on('stopping', () => daemon.stop())
			.on('stopped', () => done());
		daemon.app.use(ctx => ctx.body = 'test');
		daemon.start();

		this.slow(100);
	});

	it('valid listenAddr functions', function(done) {
		const daemon = new testDaemon({port: 0});

		daemon
			.on('started', () => daemon.doHttpTimeout())
			.on('stopping', () => daemon.stop())
			.on('stopped', () => done());
		daemon.app.use(() => new Promise(() => {}));
		daemon.start();

		this.slow(100);
	});
});
