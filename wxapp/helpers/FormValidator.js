"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../base/utils");
var FormValidator = /** @class */ (function () {
    function FormValidator() {
    }
    FormValidator.prototype.validate = function (inputs, values) {
        var res = {};
        for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
            var inputData = inputs_1[_i];
            var value = values[inputData.name];
            if (!value && !inputData.optional) {
                utils_1.utils.alert(inputData.placeholder);
                return null;
            }
            res[inputData.name] = value;
        }
        return res;
    };
    return FormValidator;
}());
exports.FormValidator = FormValidator;
