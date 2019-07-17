"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AudioManager = /** @class */ (function () {
    function AudioManager(audios) {
        this.audios = {};
        for (var name_1 in audios) {
            var url = audios[name_1];
            var context = wx.createInnerAudioContext();
            context.autoplay = false;
            context.src = url;
            context.loop = false;
            context.obeyMuteSwitch = false; //防止因为系统静音导致声音断掉
            this.audios[name_1] = context;
        }
    }
    AudioManager.prototype.play = function (name) {
        var _this = this;
        console.log("audio play:", name);
        for (var key in this.audios) {
            this.audios[key].stop();
            ;
            this.audios[key].seek(0);
        }
        setTimeout(function () {
            _this.audios[name].play();
        }, 1);
    };
    AudioManager.prototype.stop = function (name) {
        this.audios[name].stop();
    };
    return AudioManager;
}());
exports.AudioManager = AudioManager;
