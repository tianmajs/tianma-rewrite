/**
 * rewrite - rewrite for Tianma  test
 *
 * @author tianyi.jiangty@alibaba-inc
 * @date 2015-1-10
 */

'use strict';


var tianma = require('tianma');

var rewrite = require('../');


tianma(8080)
	.pipe(rewrite({
          '/build$1': /^\/test\/(.*)/,   //http://localhost:8080/test/2121
		  'http://www.baidu.com$1': /^(\/file\/.*)/  //http://localhost:8080/file/2121
      }))
    .pipe(function (next,done) { // response
		var res = this.response;
		//console.log(res.url())
        res.data('hello');
		done();
    });
	
	
	/*
	tianma(8080)
    .pipe(function* (next) {  // x-response-time
        var start = new Date;
        yield next;
        this.response.head('x-response-time', new Date - start);
    })
    .pipe(function* (next) { // response
        this.response.data('Hello World!');
    });*/