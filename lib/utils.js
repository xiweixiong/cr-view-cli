"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getName = exports.upperCase = void 0;
function upperCase(str) {
    return str.slice(0, 1).toLocaleUpperCase() + str.slice(1);
}
exports.upperCase = upperCase;
function getName(str) {
    return str
        .split('-')
        .map((v) => upperCase(v))
        .join('');
}
exports.getName = getName;
//# sourceMappingURL=utils.js.map