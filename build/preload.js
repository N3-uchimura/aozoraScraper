"use strict";
/**
 * preload.ts
 **
 * function：ipc受渡し用
**/
Object.defineProperty(exports, "__esModule", { value: true });
// モジュール
const electron_1 = require("electron"); // electron
// contextBridge
electron_1.contextBridge.exposeInMainWorld("api", {
    // ipcMainに送る
    send: (channel, data) => {
        try {
            electron_1.ipcRenderer.send(channel, data);
        }
        catch (e) {
            console.log(e);
        }
    },
    // ipcMainから受け取り
    on: (channel, func) => {
        try {
            electron_1.ipcRenderer.on(channel, (_, ...args) => func(...args));
        }
        catch (e) {
            console.log(e);
        }
    }
});
//# sourceMappingURL=preload.js.map