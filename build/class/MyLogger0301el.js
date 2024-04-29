"use strict";
/**
 * MyElLogger.ts
 *
 * name：ELLogger
 * function：Logging operation
 * updated: 2024/03/01
 **/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// define modules
const path = __importStar(require("path")); // path
const electron_log_1 = __importDefault(require("electron-log")); // Logger
// Logger class
class ELLogger {
    // construnctor
    constructor(dirpath, filename) {
        // debug
        this.debug = (message) => {
            electron_log_1.default.debug(message);
        };
        // inquire
        this.info = (message) => {
            electron_log_1.default.info(message);
        };
        // empty or not
        this.error = (e) => {
            if (e instanceof Error) {
                // error
                electron_log_1.default.error(process.pid, e.message);
            }
        };
        // Logger config
        const prefix = getNowDate(0);
        // filename tmp
        electron_log_1.default.transports.file.fileName = `${filename}.log`;
        // filename tmp
        electron_log_1.default.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
        // filename now
        const curr = electron_log_1.default.transports.file.fileName;
        // file saving path
        electron_log_1.default.transports.file.resolvePathFn = () => path.join(__dirname, `${dirpath}/${prefix}_${curr}`);
    }
}
// get now date
const getNowDate = (diff) => {
    // now
    const d = new Date();
    // combine date string
    const prefix = d.getFullYear() +
        ('00' + (d.getMonth() + 1)).slice(-2) +
        ('00' + (d.getDate() + diff)).slice(-2);
    return prefix;
};
// export module
exports.default = ELLogger;
//# sourceMappingURL=MyLogger0301el.js.map