'use strict';

const koa = require('koa');
const EventEmitter = require('events');

/* Private fields */
const symApp = Symbol('Daemon.app');
const symServer = Symbol('Daemon.server');
const symSockets = Symbol('Daemon.sockets');
const symListenAddr = Symbol('Daemon.listenAddr');

/* Private method */
const symAddSocket = Symbol('Daemon.addSocket');

class Daemon extends EventEmitter {
	constructor(listenAddr) {
		super();

		if (typeof listenAddr === 'undefined') {
			throw new Error('Requires a listenAddr.');
		}

		this[symListenAddr] = listenAddr;
		this[symServer] = null;
		this[symSockets] = [];
		this[symApp] = new koa();
	}

	get app() {
		return this[symApp];
	}

	get connections() {
		return this[symSockets].length;
	}

	get boundAddress() {
		return this[symServer].address();
	}

	[symAddSocket](socket) {
		this[symSockets].push(socket);
		socket.on('finish', () => this[symSockets].splice(this[symSockets].indexOf(socket), 1));
	}

	start() {
		if (this[symServer]) {
			throw new Error('Already started');
		}

		this[symServer] = this.app.listen(this[symListenAddr]);
		this[symServer].on('connection', socket => this[symAddSocket](socket));
		this[symServer].on('listening', () => this.emit('started'));
		this[symServer].on('close', () => this.emit('stopped'));
	}

	stop(force = true) {
		if (this[symServer]) {
			const srv = this[symServer];

			this[symServer] = null;
			this.emit('stopping');
			srv.close();
		}

		if (force) {
			this[symSockets].forEach(socket => socket.end());
		}
	}
}

module.exports = Daemon;
