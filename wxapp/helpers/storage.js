"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Storage = /** @class */ (function () {
    function Storage() {
    }
    Storage.prototype.set = function (data, callback) {
        var total = Object.keys(data).length;
        var finished = 0;
        var next = function () {
            finished += 1;
            if (finished == total) {
                callback && callback();
            }
        };
        var key;
        var _loop_1 = function () {
            var _key = key;
            wx.setStorage({
                key: key,
                data: data[_key],
                success: function () {
                    next();
                },
                fail: function () {
                    console.error("设置储存字段失败:", _key, data[_key]);
                    next();
                }
            });
        };
        for (key in data) {
            _loop_1();
        }
    };
    Storage.prototype.get = function (keys, callback) {
        var total = keys.length;
        var finished = 0;
        var res = {};
        var next = function () {
            finished += 1;
            if (finished == total) {
                callback(res);
            }
        };
        var _loop_2 = function (key) {
            wx.getStorage({
                key: key,
                success: function (_a) {
                    var data = _a.data;
                    res[key] = data;
                    next();
                },
                fail: function (e) {
                    res[key] = null;
                    console.warn("获取储存字段失败:", key);
                    next();
                }
            });
        };
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            _loop_2(key);
        }
    };
    return Storage;
}());
exports.storage = new Storage();
