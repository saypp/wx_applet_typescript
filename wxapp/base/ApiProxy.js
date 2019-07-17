"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("utils");
var MAX_REQ_PAYLOAD = 5;
var RequestManager = /** @class */ (function () {
    function RequestManager() {
        this.currentPayload = 0;
        this.queue = [];
    }
    RequestManager.prototype.add = function (proxy) {
        var _this = this;
        if (this.currentPayload < MAX_REQ_PAYLOAD) {
            this.currentPayload += 1;
            proxy.doSend(function () {
                _this.handleReqComplete();
            });
        }
        else {
            this.queue.push(proxy);
        }
    };
    RequestManager.prototype.handleReqComplete = function () {
        this.currentPayload -= 1;
        if (this.currentPayload < MAX_REQ_PAYLOAD) {
            var next = this.queue.shift();
            if (next) {
                this.add(next);
            }
        }
    };
    return RequestManager;
}());
var reqManager = new RequestManager();
var ApiProxy = /** @class */ (function () {
    function ApiProxy(method, path, urlArgs, body) {
        var _this = this;
        this.defaultPrevented = false;
        this.headers = {};
        this.camelizePrevented = false;
        this.method = method;
        this.path = path;
        this.urlArgs = urlArgs;
        if (method == "POST") {
            this.bodyArgs = body;
        }
        else {
            if (body) {
                console.error("body:", body);
                throw new Error("GET api call " + path + " shouldn't have a body");
            }
        }
        setTimeout(function () {
            _this.send();
        }, 0);
    }
    ApiProxy.commonErrorHandler = function (resData, httpStatusCode) {
        console.log("common error handler handleRes", { resData: resData, httpStatusCode: httpStatusCode });
        if (resData) {
            if (this.AUTH_ERROR_CODES.has(resData.statusCode)) {
                // 用户认证错误
                // TODO
                if (this.authErrorHandler) {
                    if (this.authErrorHandler(resData.statusCode) == true) {
                        return null;
                    }
                }
                return utils_1.default.alert("请求失败，" + resData.statusMessage + " (" + resData.statusCode + ")");
            }
            else {
                return setTimeout(function () {
                    return utils_1.default.alert("请求失败，" + resData.statusMessage + " (" + resData.statusCode + ")");
                }, 1);
            }
        }
        else {
            if (httpStatusCode) {
                return setTimeout(function () {
                    return utils_1.default.alert("请求失败，请检查网络设置后重试 (" + httpStatusCode + ")");
                }, 1);
            }
            else {
                console.error("got http error, httpStatusCode undefined, not report");
                return null;
            }
        }
    };
    ;
    /** 此方法由 manager 调用 */
    ApiProxy.prototype.doSend = function (callback) {
        if (this.method === "GET") {
            this.sendGet(callback);
        }
        else {
            this.sendPost(callback);
        }
    };
    ApiProxy.prototype.send = function () {
        var _this = this;
        if (this.mockResult) {
            setTimeout(function () {
                console.warn("[mock] mock api result for api call:", _this.path, _this);
                if (_this.onSuccess) {
                    _this.onSuccess(_this.mockResult);
                }
                if (_this.onAlways) {
                    _this.onAlways();
                }
            }, this.mockDelay); //sim network latency for a little bit
            return;
        }
        reqManager.add(this);
    };
    ApiProxy.prototype.getAuthHeaders = function () {
        return { "X-Access-Token": ApiProxy.accessToken };
    };
    ApiProxy.prototype.sendGet = function (callback) {
        var _this = this;
        var path;
        if (this.path.indexOf("http") === 0) {
            path = utils_1.default.underlizeKey(this.path);
        }
        else {
            path = ApiProxy.host + ApiProxy.basePath + utils_1.default.underlizeKey(this.path);
        }
        var url = utils_1.default.genApiUrl(path, utils_1.default.underlize(this.urlArgs));
        var headers = this.getAuthHeaders();
        for (var key in this.headers) {
            headers[key] = this.headers[key];
        }
        wx.request({
            url: url,
            method: "GET",
            dataType: "text",
            header: headers,
            success: function (res, httpStatus) {
                _this.handleRes(true, httpStatus, res["data"]);
                callback(true);
            },
            fail: function (res, httpStatus) {
                // TODO: is http status null?
                _this.handleRes(false, httpStatus, res);
                callback(false);
            },
        });
    };
    ApiProxy.prototype.sendPost = function (callback) {
        var _this = this;
        var path;
        if (this.path.indexOf("http") === 0) {
            path = utils_1.default.underlizeKey(this.path);
        }
        else {
            path = ApiProxy.host + ApiProxy.basePath + utils_1.default.underlizeKey(this.path);
        }
        var url = utils_1.default.genApiUrl(path, utils_1.default.underlize(this.urlArgs));
        var data;
        var headers = this.getAuthHeaders();
        for (var key in this.headers) {
            headers[key] = this.headers[key];
        }
        if (this.bodyArgs) {
            data = JSON.stringify(utils_1.default.underlize(this.bodyArgs));
            headers["Content-Type"] = "application/json";
        }
        console.log(url, "url");
        wx.request({
            url: url,
            method: "POST",
            dataType: "text",
            header: headers,
            data: data || "",
            success: function (res, httpStatus) {
                console.log(res);
                _this.handleRes(true, httpStatus, res["data"]);
                callback(true);
            },
            fail: function (res) {
                _this.handleRes(false, null, res);
                callback(false);
            }
        });
    };
    ApiProxy.prototype.handleRes = function (reqSuccess, httpStatusCode, data) {
        var preventCamelize = this.camelizePrevented;
        var parsedData;
        if (!reqSuccess) {
            // reqSuccess 为 false 说明 http 请求本身失败
            console.error("HTTP Error " + httpStatusCode + " for api call: " + this.path);
            var skipDefault = false;
            if (this.onFail) {
                var ans = this.onFail(httpStatusCode);
                if (ans === true) {
                    skipDefault = true;
                }
            }
            if (this.onFailOrError) {
                var ans = this.onFailOrError(httpStatusCode);
                if (ans === true) {
                    skipDefault = true;
                }
            }
            if (!skipDefault && !this.defaultPrevented) {
                ApiProxy.commonErrorHandler(null, httpStatusCode);
            }
        }
        else {
            // reqSuccess 为 true 说明 http 请求本身成功，需要进一步判断返回值
            var objData = void 0;
            if (typeof data === "string") {
                try {
                    objData = JSON.parse(data);
                }
                catch (error) {
                    console.log(this);
                    console.error("parse api res error");
                    console.log({ apiResData: data });
                    console.error(error);
                    objData = {
                        success: false,
                        statusCode: 0,
                        statusMessage: "无法解析请求返回值"
                    };
                }
            }
            else {
                objData = data;
            }
            if (!preventCamelize) {
                parsedData = utils_1.default.camelize(objData);
            }
            else {
                parsedData = objData;
                parsedData.statusCode = data["status_code"];
                parsedData.statusMessage = data["status_message"];
            }
            if (parsedData.success) {
                if (this.onSuccess) {
                    try {
                        this.onSuccess(parsedData);
                    }
                    catch (error) {
                        console.error("Api Success Callback Error for " + this.path);
                        throw error;
                    }
                }
            }
            else {
                console.error("got error for api call", this.path);
                console.error(parsedData.statusCode, parsedData.statusMessage, { apiProxy: this });
                var skipDefault = false;
                if (this.onError) {
                    var ans = this.onError(parsedData.statusMessage, parsedData.statusCode, parsedData);
                    if (ans === true) {
                        skipDefault = true;
                    }
                }
                if (this.onFailOrError) {
                    var ans = this.onFailOrError(httpStatusCode, parsedData.statusMessage, parsedData.statusCode, parsedData);
                    if (ans === true) {
                        skipDefault = true;
                    }
                }
                if (new Set([10033]).has(parsedData.statusCode)) {
                    // 特定类型的报错不会抛出默认的 alert，它们包括：
                    // - 10033 没有操作此公众号的权限（可能由于它已经解绑）
                    skipDefault = true;
                }
                if (!skipDefault && !this.defaultPrevented) {
                    ApiProxy.commonErrorHandler(parsedData, 200);
                }
            }
        }
        if (this.onAlways) {
            return this.onAlways();
        }
    };
    /**
     * 设置api成功回调
     * @param callback 成功回调
     */
    ApiProxy.prototype.success = function (callback) {
        this.onSuccess = callback;
        return this;
    };
    /**
     * 设置 api 失败回调，会在 http 请求不成功时触发
     * @param callback 失败回调，若返回 true 则会阻止默认的 alert 行为
     */
    ApiProxy.prototype.fail = function (callback) {
        this.onFail = callback;
        return this;
    };
    /**
     * 设置 api 错误回调，会在 http 请求成功，但是响应结果中 success 字段为 false 时触发
     * @param callback 错误回调，若返回true则会阻止默认的alert行为
     */
    ApiProxy.prototype.error = function (callback) {
        this.onError = callback;
        return this;
    };
    /**
     * 设置 api 失败或错误回调，会在 http 请求失败或者响应结果中 success 字段为 false 时触发
     * @param callback 错误或失败回调，若返回true则会阻止默认的alert行为
     */
    ApiProxy.prototype.failOrError = function (callback) {
        this.onFailOrError = callback;
        return this;
    };
    /**
     * 设置 api 结束回调，不论 api 成功或失败，都会调用此回调。适用场景是一些不需关心 api 本身是否失败的场景（比如按钮解锁）
     * @param callback 回调函数。函数没有参数，如果需要参数，应当使用其他的方法
     */
    ApiProxy.prototype.always = function (callback) {
        this.onAlways = callback;
        return this;
    };
    /**
     * 阻止api结果处理环节中的默认操作（比如弹出默认的alert提示）
     */
    ApiProxy.prototype.preventDefault = function () {
        this.defaultPrevented = true;
        return this;
    };
    /**
     * 是否禁用api结果中的驼峰转换（不对基础字段生效)
     */
    ApiProxy.prototype.preventCamelize = function () {
        this.camelizePrevented = true;
        return this;
    };
    /**
     * 设置请求 header
     * @param name 名称
     * @param value 值
     */
    ApiProxy.prototype.setHeader = function (name, value) {
        this.headers[name] = value;
        return this;
    };
    /**
     * 为 api 调用设置虚拟返回值，用于方便调试
     * @param data 虚拟返回值 必须和标准的返回值是同一格式
     */
    ApiProxy.prototype.mock = function (data, mockDelay) {
        if (mockDelay === void 0) { mockDelay = 300; }
        this.mockResult = data;
        if (!this.mockResult.success) {
            this.mockResult.success = true;
            this.mockResult.statusCode = 200;
            this.mockResult.statusMessage = "ok";
        }
        this.mockDelay = mockDelay;
        return this;
    };
    ApiProxy.host = "";
    ApiProxy.basePath = "";
    ApiProxy.accessToken = "";
    ApiProxy.AUTH_ERROR_CODES = new Set([10031, 10032, 10036]);
    ApiProxy.maxReqPayload = 5;
    return ApiProxy;
}());
exports.ApiProxy = ApiProxy;
exports.default = ApiProxy;
