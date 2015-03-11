## tianma-rewrite(天马 rewrite中间件)


## 说明 Introduction

If request arrived with this.request.path match the rule, then redirect the request base on the matched rule, or proxyed to the server.
如果到达的请求路径加参数（this.request.path）满足匹配规则，则根据目标地址的类型，该模块或对请求进行路径重定向，或进行服务端代理。



## 安装 Install

	npm install tianma-rewrite

## 实例 Example

Rewrite any requests to any directory.

将任意请求重定向到某个目录下。

	tianma(8080)
		.pipe(rewrite({
	          '/build$1': /^\/test\/(.*)/
	      }))

Rewrite some request to remote server.
将对指定目录的请求代理到远程服务器。


	tianma(8080)
		.pipe(rewrite({
	          'http://www.baidu.com$1': /^(\/file\/.*)/ 
	      }))
## 协议 License

https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE
