'use strict';

var http = require('http');
var rewrite = require('..');
var request = require('supertest');
var tianma = require('tianma');

function createApp() {
    var app = tianma();
    var server = http.createServer(app.run);

    app.server = server;

    return app;
}

describe('rewrite(proxy_rule)', function () {
    var remote;
    var port;

    function createServer(rule) {
        var app = createApp();

        app.use(rewrite(rule))
            .use(function *(next) {
                this.response
                    .data('reach the bottom');
            });

        return app.server;
    }

    before(function (done) {
        var app = createApp();

        app.use(function *(next) {
            var req = this.request;
            var data = [
                req.method(),
                req.hostname,
                req.path,
                req.head('x-custom'),
                req.data().toString()
            ].join('|');

            if (req.pathname === '/magic') {
                this.response
                    .status(403);
            } else {
                this.response
                    .status(200)
                    .data(data);
            }
        });

        app.server.listen(0, '127.0.0.1', function (err) {
            if (err) {
                done(err);
            } else {
                remote = app.server;
                port = remote.address().port;
                done();
            }
        });
    });

    after(function (done) {
        remote.close(done);
    });

    it('should pass the request to remote exactly', function (done) {
        var rule = {};

        rule['http://127.0.0.1:' + port + '/build$1'] = /^(.*)/;

        request(createServer(rule))
            .post('/foo.js?hello=world')
            .set('host', 'example.com')
            .set('x-custom', 'foo')
            .send('bar')
            .expect('POST|example.com|/build/foo.js?hello=world|foo|bar')
            .end(done);
    });

    it('should give the hostname in rule higher priority', function (done) {
        var rule = {};

        rule['http://sample.com@127.0.0.1:' + port + '$1'] = /^(.*)/;

        request(createServer(rule))
            .get('/foo.js?hello=world')
            .set('host', 'www.example.com')
            .set('x-custom', 'foo')
            .send('bar')
            .expect('GET|sample.com|/foo.js?hello=world|foo|bar')
            .end(done);
    });

    it('should use the hostname in rule when it is the only one', function (done) {
        var rule = {};

        rule['http://sample.com@127.0.0.1:' + port + '$1'] = /^(.*)/;

        request(createServer(rule))
            .get('/foo.js?hello=world')
            .set('x-custom', 'foo')
            .send('bar')
            .expect('GET|sample.com|/foo.js?hello=world|foo|bar')
            .end(done);
    });

    it('should pass the request down when remote returns no 200', function (done) {
        var rule = {};

        rule['http://127.0.0.1:' + port + '$1'] = /^(.*)/;

        request(createServer(rule))
            .get('/magic')
            .expect(403)
            .expect('reach the bottom')
            .end(done);
    });
});
