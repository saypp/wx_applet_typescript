"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = {
    initPage: 'home',
    apiHost: "",
    assetsDir: "",
    skipAuthCheck: false,
    forceLogin: false,
    debugUserOpenid: null,
    debugUserToken: null,
};
var localConfigs_1 = require("./localConfigs");
var key;
for (key in localConfigs_1.localConfigs) {
    exports.configs[key] = localConfigs_1.localConfigs[key];
}
