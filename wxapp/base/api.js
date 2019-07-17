"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiProxy_1 = require("ApiProxy");
var api;
(function (api) {
    api.AUTH_ERROR_CODES = ApiProxy_1.ApiProxy.AUTH_ERROR_CODES;
    function get(path, urlArgs) {
        return new ApiProxy_1.ApiProxy("GET", path, urlArgs);
    }
    function post(path, urlArgs, bodyArgs) {
        return new ApiProxy_1.ApiProxy("POST", path, urlArgs, bodyArgs);
    }
    // ================
    // api declarations
    // ===============
    function testPost() {
        return post("/test", {}, {});
    }
    api.testPost = testPost;
    function testGet() {
        return get("/test", {});
    }
    api.testGet = testGet;
    function wxappAuth(code, userInfo, iv, encryptedData, inviterOpenid, userOpenid, inviterToken) {
        return post("/auth/wxapp_login", { inviterOpenid: inviterOpenid, userOpenid: userOpenid, inviterToken: inviterToken }, { code: code, iv: iv, encryptedData: encryptedData });
    }
    api.wxappAuth = wxappAuth;
})(api = exports.api || (exports.api = {}));
exports.default = api;
