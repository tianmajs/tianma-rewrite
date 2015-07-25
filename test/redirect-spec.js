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

describe('rewrite(redirect_rule)', function () {
    function createServer(rule) {
        var app = createApp();

        app.use(rewrite(rule))
            .use(function *(next) {
                this.response
                    .data(this.request.path);
            });

        return app.server;
    }

    function createServer2(rule) {
        var app = createApp();

        app.use(function *(next) {
                yield next;
                this.response
                    .data(this.request.path);
            })
            .use(rewrite({
                '/build$1': /^(.*)/
            }));

        return app.server;
    }


    it('should support pathname rewrite', function (done) {
        request(createServer({
            '/build$1': /^(.*)/
        }))
            .get('/foo.js')
            .expect('/build/foo.js')
            .end(done);
    });

    it('should try the match rule in sequence', function (done) {
        request(createServer({
            '/alpha$1': /^\/about\/(.*)/,
            '/beta$1': /^(.*)/
        }))
            .get('/foo.js')
            .expect('/beta/foo.js')
            .end(done);
    });

    it('should change the query as wished', function (done) {
        request(createServer({
            '$1?changed': /^(.*?)(\?.*)?$/
        }))
            .get('/foo.js?bar')
            .expect('/foo.js?changed')
            .end(done);
    });

    it('should bypass the unmatched request', function (done) {
        request(createServer({
            '/alpha$1': /^\/about\/(.*)/,
        }))
            .get('/foo.js')
            .expect('/foo.js')
            .end(done);
    });

    it('should restore the original url in upstream', function (done) {
        request(createServer2())
            .get('/foo.js')
            .expect('/foo.js')
            .end(done);
    });
});
