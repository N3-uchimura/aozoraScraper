"use strict";
/*
 * index.ts
 *
 * function：Node.js server
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
// 定数
const FIRST_PAGE_ROWS = 2;
const MAX_PAGE_ROWS = 52;
const DEF_AOZORA_URL = 'https://www.aozora.gr.jp/index_pages/sakuhin_'; // スクレイピング対象サイトルート
// import modules
const electron_1 = require("electron"); // electron
const path = __importStar(require("path")); // path
const myScraper0429el_1 = require("./class/myScraper0429el"); // scraper
const MyLogger0301el_1 = __importDefault(require("./class/MyLogger0301el")); // logger
// ログ設定np
const logger = new MyLogger0301el_1.default('../../logs', 'access');
// スクレイピング用
const puppScraper = new myScraper0429el_1.Scrape();
// 成功数
let successCounter = 0;
// 失敗数
let failCounter = 0;
// list(作品一覧)
const fixLinkSelector = 'body > center > table.list > tbody > ';
// 次へセレクタ
const fixNextSelector = 'body > table > tbody > tr > td:nth-child(2)';
// zipリンク)
const zipLinkSelector = 'body > table.download > tbody > tr:nth-child(2) > td:nth-child(3) > a';
// リンク集
const linkSelection = Object.freeze({
    あ: 'a1.html',
    い: 'i1.html',
    う: 'u1.html',
    え: 'e1.html',
    お: 'o1.html',
    か: 'ka1.html',
    き: 'ki1.html',
    く: 'ku1.html',
    け: 'ke1.html',
    こ: 'ko1.html',
    さ: 'sa1.html',
    し: 'si1.html',
    す: 'su1.html',
    せ: 'se1.html',
    そ: 'so1.html',
    た: 'ta1.html',
    ち: 'ti1.html',
    つ: 'tu1.html',
    て: 'te1.html',
    と: 'to1.html',
    な: 'na1.html',
    に: 'ni1.html',
    ぬ: 'nu1.html',
    ね: 'ne1.html',
    の: 'no1.html',
    は: 'ha1.html',
    ひ: 'hi1.html',
    ふ: 'hu1.html',
    へ: 'he1.html',
    ほ: 'ho1.html',
    ま: 'ma1.html',
    み: 'mi1.html',
    む: 'mu1.html',
    め: 'me1.html',
    も: 'mo1.html',
    や: 'ya1.html',
    ゆ: 'yu1.html',
    よ: 'yo1.html',
    ら: 'ra1.html',
    り: 'ri1.html',
    る: 'ru1.html',
    れ: 're1.html',
    ろ: 'ro1.html',
    わ: 'wa1.html',
    を: 'wo1.html',
    ん: 'nn1.html',
    A: 'zz1.html',
});
/*
 メイン
*/
// ウィンドウ定義
let mainWindow;
// 起動確認フラグ
let isQuiting;
// 最終配列
let finalResultArray = [];
// ウィンドウ作成
const createWindow = () => {
    try {
        // ウィンドウ
        mainWindow = new electron_1.BrowserWindow({
            width: 1200, // 幅
            height: 1000, // 高さ
            webPreferences: {
                nodeIntegration: false, // Node.js利用許可
                contextIsolation: true, // コンテキスト分離
                preload: path.join(__dirname, 'preload.js'), // プリロード
            },
        });
        // index.htmlロード
        mainWindow.loadFile(path.join(__dirname, '../index.html'));
        // 準備完了
        mainWindow.once('ready-to-show', () => {
            // 開発モード
            mainWindow.webContents.openDevTools();
        });
        // 最小化のときはトレイ常駐
        mainWindow.on('minimize', (event) => {
            // キャンセル
            event.preventDefault();
            // ウィンドウを隠す
            mainWindow.hide();
            // falseを返す
            event.returnValue = false;
        });
        // 閉じる
        mainWindow.on('close', (event) => {
            // 起動中
            if (!isQuiting) {
                // apple以外
                if (process.platform !== 'darwin') {
                    // falseを返す
                    event.returnValue = false;
                }
            }
        });
        // ウィンドウが閉じたら後片付けする
        mainWindow.on('closed', () => {
            // ウィンドウをクローズ
            mainWindow.destroy();
        });
    }
    catch (e) {
        // エラー処理
        if (e instanceof Error) {
            // メッセージ表示
            logger.error(`${e.message})`);
        }
    }
};
// サンドボックス有効化
electron_1.app.enableSandbox();
// 処理開始
electron_1.app.on('ready', async () => {
    logger.info('app: electron is ready');
    // ウィンドウを開く
    createWindow();
    // アイコン
    const icon = electron_1.nativeImage.createFromPath(path.join(__dirname, '../assets/aozora.ico'));
    // トレイ
    const mainTray = new electron_1.Tray(icon);
    // コンテキストメニュー
    const contextMenu = electron_1.Menu.buildFromTemplate([
        // 表示
        {
            label: '表示', click: () => {
                mainWindow.show();
            }
        },
        // 閉じる
        {
            label: '閉じる', click: () => {
                electron_1.app.quit();
            }
        }
    ]);
    // コンテキストメニューセット
    mainTray.setContextMenu(contextMenu);
    // ダブルクリックで再表示
    mainTray.on('double-click', () => mainWindow.show());
});
// 起動時
electron_1.app.on('activate', () => {
    // 起動ウィンドウなし
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        // 再起動
        createWindow();
    }
});
// 閉じるボタン
electron_1.app.on('before-quit', () => {
    // 閉じるフラグ
    isQuiting = true;
});
// 終了
electron_1.app.on('window-all-closed', () => {
    logger.info('app: close app');
    // 閉じる
    electron_1.app.quit();
});
/*
 IPC
*/
// スクレイピング
electron_1.ipcMain.on('scrape', async (event, _) => {
    try {
        logger.info('ipc: scrape mode');
        // スクレイパー初期化
        await puppScraper.init();
        // URL
        for await (const [key, url] of Object.entries(linkSelection)) {
            // トップへ
            await puppScraper.doGo(DEF_AOZORA_URL + url);
            // wait for selector
            await puppScraper.doWaitSelector(fixNextSelector, 3000);
            // 対象が存在する
            if (await puppScraper.doCheckSelector(fixNextSelector)) {
                // 合計取得数更新
                event.sender.send('total', 30);
                // 取得中URL
                event.sender.send('statusUpdate', `${key} 行`);
                // スクレイプ
                await doPageScrape();
            }
        }
        // 終了メッセージ
        showmessage('info', '取得が終わりました');
    }
    catch (e) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});
// スクレイピング停止
electron_1.ipcMain.on('exit', async () => {
    try {
        logger.info('ipc: exit mode');
        // 質問項目
        const options = {
            type: 'question',
            title: '質問',
            message: '終了',
            detail: '終了してよろしいですか？これまでのデータは破棄されます。',
            buttons: ['はい', 'いいえ'],
            cancelId: -1, // Escで閉じられたときの戻り値
        };
        // 選んだ選択肢
        const selected = electron_1.dialog.showMessageBoxSync(options);
        // はいを選択
        if (selected == 0) {
            // 閉じる
            electron_1.app.quit();
        }
    }
    catch (e) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});
// do page scraping
const doPageScrape = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info('module: doPageScrape mode');
            // promises
            let pagePromises = [];
            console.log(await puppScraper.doCountChildren(fixNextSelector));
            // 収集ループ
            for (let i = 1; i < 10 + 1; i++) {
                // ページセレクタ
                const bookLinkSelector = `${fixNextSelector} > a:nth-child(${i})`;
                await puppScraper.doWaitFor(1000);
                // 対象が存在する
                if (await puppScraper.doCheckSelector(bookLinkSelector)) {
                    console.log('hage');
                    // 最後のページ
                    if (i == 10) {
                        // wait and click
                        await Promise.all([
                            // wait
                            await puppScraper.doWaitFor(1000),
                            // ページ番号クリック
                            await puppScraper.doClick(bookLinkSelector),
                        ]);
                        // 成功
                        successCounter++;
                    }
                    else {
                        // 収集ループ
                        for (let j = FIRST_PAGE_ROWS; j < MAX_PAGE_ROWS + 2; j++) {
                            // 結果収集
                            const result = doUrlScrape(j);
                            // 結果格納
                            pagePromises.push(result);
                            // 成功
                            successCounter++;
                        }
                    }
                }
            }
            // 結果
            resolve(pagePromises);
        }
        catch (e) {
            // 結果 
            reject('error');
            // 失敗
            failCounter++;
        }
    });
};
// do url scraping
const doUrlScrape = async (index) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info('module: doUrlScrape mode');
            // セレクタ
            const listLinkSelector = `tr:nth-child(${index}) > td:nth-child(2) > a`;
            // 最終セレクタ
            const finalLinkSelector = fixLinkSelector + listLinkSelector;
            // wait for datalist
            await puppScraper.doWaitSelector(finalLinkSelector, 3000);
            // 対象が存在する
            if (await puppScraper.doCheckSelector(finalLinkSelector)) {
                logger.info(`searching for ${index}`);
                // wait and click
                await Promise.all([
                    // wait
                    await puppScraper.doWaitFor(1000),
                    // url
                    await puppScraper.doClick(finalLinkSelector),
                ]);
                // wait for datalist
                await puppScraper.doWaitSelector(zipLinkSelector, 3000);
                // 対象が存在する
                if (await puppScraper.doCheckSelector(zipLinkSelector)) {
                    logger.info(`getting ${index}`);
                    // wait and click
                    await Promise.all([
                        // wait
                        await puppScraper.doWaitFor(1000),
                        // zipダウンロード
                        await puppScraper.doClick(zipLinkSelector),
                    ]);
                    // zipダウンロード完了
                    resolve();
                }
            }
            else {
                // 結果
                logger.debug('no selector');
                reject('error');
            }
        }
        catch (e) {
            // 結果 
            reject();
        }
    });
};
// メッセージ表示
const showmessage = async (type, message) => {
    try {
        logger.info('module: showmessage mode');
        // モード
        let tmpType;
        // タイトル
        let tmpTitle;
        // urlセット
        switch (type) {
            // 通常モード
            case 'info':
                tmpType = 'info';
                tmpTitle = '情報';
                break;
            // エラーモード
            case 'error':
                tmpType = 'error';
                tmpTitle = 'エラー';
                break;
            // 警告モード
            case 'warning':
                tmpType = 'warning';
                tmpTitle = '警告';
                break;
            // それ以外
            default:
                tmpType = 'none';
                tmpTitle = '';
        }
        // オプション
        const options = {
            type: tmpType, // タイプ
            message: tmpTitle, // メッセージタイトル
            detail: message, // 説明文
        };
        // ダイアログ表示
        electron_1.dialog.showMessageBox(options);
    }
    catch (e) {
        // エラー型
        if (e instanceof Error) {
            // エラー
            logger.error(e.message);
        }
    }
};
//# sourceMappingURL=index.js.map