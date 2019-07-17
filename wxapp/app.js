"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var configs_1 = require("./base/configs");
var ApiProxy_1 = require("./base/ApiProxy");
var api_1 = require("./base/api");
var utils_1 = require("./base/utils");
var storage_1 = require("./helpers/storage");
var app = null;
ApiProxy_1.ApiProxy.host = configs_1.configs.apiHost;
// ApiProxy.basePath = "/api";
ApiProxy_1.ApiProxy.basePath = "";
ApiProxy_1.ApiProxy.authErrorHandler = function () {
    app.logout(function () {
        utils_1.utils.jump("home").redirect(null);
    });
};
var globalData = {
    user: null,
};
var appContext = {
    globalData: globalData,
    init: function (inviterOpenid, userOpenid, inviterToken, callback) {
        var _this = this;
        storage_1.storage.get(["user"], function (_a) {
            var user = _a.user;
            console.log("user data in stroage", user);
            if (!user) {
                user = {};
            }
            if (configs_1.configs.debugUserToken) {
                user.token = configs_1.configs.debugUserToken;
            }
            if (configs_1.configs.debugUserOpenid) {
                user.openid = configs_1.configs.debugUserOpenid;
            }
            _this.globalData.user = user;
            ApiProxy_1.ApiProxy.accessToken = user.token;
            _this.login(inviterOpenid, userOpenid, inviterToken, function () { callback(); }, configs_1.configs.forceLogin || false);
        });
    },
    login: function (inviterOpenid, userOpenid, inviterToken, callback, force, allowAbort) {
        var _this = this;
        if (force === void 0) { force = true; }
        if (allowAbort === void 0) { allowAbort = false; }
        // 调用微信登录接口
        if (globalData.user && globalData.user.openid && !force) {
            console.log("** skip register for user data exists");
            if (configs_1.configs.skipAuthCheck) {
                return callback();
            }
            // 在页面载入的时候就下载分享的图片
            // NOTE: 为了性能考虑，现在没有登录环节，只有注册环节
            callback();
            // api.getMe().success(() => {
            //   callback();
            // }).error((msg, code) => {
            //   if (code == 403) {
            //     this.logout()
            //     setTimeout(() => {
            //       // TODO: 需要处理index的options
            //       utils.jump("index").redirect(null);
            //     }, 1000);
            //     return true;
            //   }
            //   return null;
            // })
        }
        else {
            if (configs_1.configs.skipAuthCheck) {
                callback();
                return;
            }
            console.error("** do login");
            wx.login({
                success: function (_a) {
                    var code = _a.code, errMsg = _a.errMsg;
                    if (code) {
                        wx.getUserInfo({
                            success: function (_a) {
                                var userInfo = _a.userInfo, iv = _a.iv, encryptedData = _a.encryptedData;
                                api_1.api.wxappAuth(code, userInfo, iv, encryptedData, inviterOpenid, userOpenid, inviterToken).success(function (_a) {
                                    var user = _a.user;
                                    globalData.user = user;
                                    console.log(user);
                                    ApiProxy_1.ApiProxy.accessToken = user.token;
                                    storage_1.storage.set({ user: user }, callback);
                                }).failOrError(function () {
                                    console.log("enter, fail");
                                    setTimeout(function () {
                                        _this.login(inviterOpenid, userOpenid, inviterToken, callback);
                                    }, 1000);
                                });
                            },
                            fail: function (res) {
                                console.error("get user info data error, :" + errMsg);
                                utils_1.utils.showHintToast("用户权限认证");
                                setTimeout(function () {
                                    _this.manualAuth(function () {
                                        _this.login(inviterOpenid, userOpenid, inviterToken, callback);
                                    });
                                }, 200);
                            }
                        });
                    }
                    else {
                        console.error("\u767B\u5F55\u5931\u8D25, \u9519\u8BEF\u6D88\u606F:" + errMsg);
                        if (allowAbort) {
                            utils_1.utils.confirm("\u4F60\u5FC5\u987B\u767B\u5F55\u624D\u53EF\u4EE5\u6B63\u5E38\u4F7F\u7528\u767E\u4E07\u9EC4\u91D1\u5C4B\uFF0C\u70B9\u51FB\u786E\u5B9A\u91CD\u65B0\u767B\u5F55", "登录失败").accept(function () {
                                _this.login(inviterOpenid, userOpenid, inviterToken, callback);
                            });
                        }
                        else {
                            utils_1.utils.alert("\u4F60\u5FC5\u987B\u767B\u5F55\u624D\u53EF\u4EE5\u6B63\u5E38\u4F7F\u7528\u767E\u4E07\u9EC4\u91D1\u5C4B\uFF0C\u70B9\u51FB\u786E\u5B9A\u91CD\u65B0\u767B\u5F55", "登录失败").accept(function () {
                                _this.login(inviterOpenid, userOpenid, inviterToken, callback);
                            });
                        }
                    }
                },
                fail: function () {
                    console.error("调用login接口失败");
                    if (allowAbort) {
                        utils_1.utils.confirm("无法调用微信登录，点击重试", "登录失败").accept(function () {
                            _this.login(inviterOpenid, userOpenid, inviterToken, callback);
                        });
                    }
                    else {
                        utils_1.utils.alert("无法调用微信登录，点击重试", "登录失败").accept(function () {
                            _this.login(inviterOpenid, userOpenid, inviterToken, callback);
                        });
                    }
                }
            });
        }
    },
    logout: function (callback) {
        // 此api用于调试，正常逻辑中不会调用
        console.log("logging out");
        globalData.user = null;
        storage_1.storage.set({ user: null }, callback);
    },
    // 由于微信认证第一次授权失败后，不会进行第二次的认证弹框的提示，这里需要用户手动进行认证
    manualAuth: function (callback) {
        wx.openSetting({
            success: function (_a) {
                var authSetting = _a.authSetting;
                if (authSetting["scope.userInfo"]) {
                    callback();
                }
                else {
                    utils_1.utils.showFailToast("权限认证失败");
                }
            }
        });
    },
    updateGlobalUnreadBadge: function (callback) {
        // api.getNotificationUnreadCount().success(({ count }) => {
        //   this.globalData.globalUnreadBadge = count;
        //   if (callback) {
        //     callback(count);
        //   }
        // })
    },
    // genShareImage(shareBg: string, callback: () => void): void {
    //   let token = globalData.user.token;
    //   let urlBg = shareBg;
    //   let urlQr = `${configs.shareQrApiHost}/user/gen_invite_qr?user_token=${token}`;
    //   // let avatar = this.globalData.user.avatar;
    //   let fn = (url: string) => {
    //     return new Promise<string>((resolve, reject) => {
    //       console.log("do download", url);
    //       this.downloadImageFile(url, resolve, reject);
    //     })
    //   }
    //   Promise.all<string>([fn(urlBg), fn(urlQr)]).then((res) => {
    //     console.log("got share imgComponent files", res);
    //     callback();
    //   }).catch((e) => {
    //     console.error("download share image error");
    //     console.error(e)
    //   });
    // },
    downloadImageFile: function (url, resolve, reject) {
        if (url) {
            wx.downloadFile({
                url: url,
                success: function (_a) {
                    var tempFilePath = _a.tempFilePath;
                    resolve(tempFilePath);
                },
                fail: function (res) {
                    reject(res);
                }
            });
        }
    },
};
App(__assign({}, appContext, { onLaunch: function () {
        console.log("App launched");
        app = this;
    } }));
