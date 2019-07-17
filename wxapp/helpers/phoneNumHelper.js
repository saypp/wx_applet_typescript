"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../base/utils");
var api_1 = require("../base/api");
var phoneNumHelper;
(function (phoneNumHelper) {
    function handleWxGetPhoneNumRes(e, callback) {
        if (e.detail.errMsg != "getPhoneNumber:ok") {
            callback({ success: false, errMsg: e.detail.errMsg });
            return;
        }
        utils_1.utils.showLoadingToast("获取中");
        var _a = e.detail, iv = _a.iv, encryptedData = _a.encryptedData;
        api_1.api.decryptPhoneNumber(encryptedData, iv).success(function (_a) {
            var phoneNumber = _a.phoneNumber;
            console.log("获得手机号成功:", phoneNumber);
            callback({ success: true, phoneNum: phoneNumber });
        }).failOrError(function () {
            callback({ success: false, errMsg: "解密错误" });
        }).always(function () {
            utils_1.utils.hideLoadingToast();
        });
        // wx.login({
        //   success: ({ code, errMsg }) => {
        //     console.log("login got code", code);
        //     if (code) {
        //       let { iv, encryptedData } = e.detail;
        //       api.decryptPhoneNumber(encryptedData, iv, code).success(({ phoneNumber }) => {
        //         console.log("获得手机号成功:", phoneNumber);
        //         callback({ success: true, phoneNum: phoneNumber });
        //         // this.setInputValue("phoneNumber", phoneNumber)
        //       }).failOrError(() => {
        //         onFail();
        //         return true;
        //       }).always(() => {
        //         utils.hideLoadingToast();
        //       });
        //     } else {
        //       onFail();
        //     }
        //   },
        //   fail: () => {
        //     onFail();
        //   }
        // });
    }
    phoneNumHelper.handleWxGetPhoneNumRes = handleWxGetPhoneNumRes;
})(phoneNumHelper = exports.phoneNumHelper || (exports.phoneNumHelper = {}));
