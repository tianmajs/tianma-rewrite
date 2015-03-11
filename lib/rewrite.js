/**
 * rewrite - rewrite for Tianma
 *
 * @author tianyi.jiangty@alibaba-inc
 * @date 2015-1-10
 */

'use strcit';

var util = require('mini-util'),
request = require('./request');

var debug = require('debug')('tianma-rewrite');

var PATTERN_REPLACEMENT = /\$(\d+)/g,

PATTERN_URL = /^(\w+\:)?\/\//;

/**
 * Filter factory.
 * @param [rules] {Object}
 * @return {Function}
 */
/*Not for generator*/
module.exports = function (rules) {
	rules = rules || {};

	/**
	 * Apply a matched rule.
	 * @param path {string}
	 * @return {string|null}
	 */
	function match(path) {
		var keys = util.keys(rules),
		len = keys.length,
		i = 0,
		replacement,
		pattern,
		re;

		for (; i < len; ++i) {
			replacement = keys[i];
			pattern = rules[replacement];

			if (re = path.match(pattern)) { // Assign.
				return replacement
				.replace(PATTERN_REPLACEMENT, function (all, index) {
					return re[index];
				});
			}
		}

		return null;
	}

	return function (next, done) {
		var res = this.response,
		req = this.request;
		
		
		var href = match(req.path);
		
		debug('rewrite %s -> %s', href, rules);

		if (href) {
			if (PATTERN_URL.test(href)) { // Proxy.
				request({
					method : req.method(),
					href : href,
					headers : util.merge(req.head()), // Make a copy.
					body : req.data().toString()
				}, function (err, response) {

					if (err) {
						done(err);
					} else if (res.status() === 404) {
						next(function(){
							res.status(response.statusCode)
							.head(response.headers)
							.data(response.body);
							done();
						});

					} else {
						next(function(){
							res.status(response.statusCode)
							.head(response.headers)
							.data(response.body);
							done();
						});
					}
				});
			} else { // Redirect.

				next(function () {
					req.url(href);
					done();
				})
			}
		} else { // Need not to rewrite.
			next(function(){
				done();
			});
		}
	};
};