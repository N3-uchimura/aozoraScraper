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
// 成功数
let successCounter = 0;
// 失敗数
let failCounter = 0;
// ログ設定np
const logger = new MyLogger0301el_1.default('../../logs', 'access');
// スクレイピング用
const puppScraper = new myScraper0429el_1.Scrape();
// 次へセレクタ
const fixNextSelector = 'body > table > tbody > tr > td:nth-child(2)';
// zipリンク)
const zipLinkSelector = 'body > table.download > tbody > tr:nth-child(2) > td:nth-child(3) > a';
// リンク集
const linkSelection = Object.freeze({
    //あ: 'a',
    //い: 'i',
    //う: 'u',
    //え: 'e',
    お: 'o',
    か: 'ka',
    き: 'ki',
    く: 'ku',
    け: 'ke',
    こ: 'ko',
    さ: 'sa',
    し: 'si',
    す: 'su',
    せ: 'se',
    そ: 'so',
    た: 'ta',
    ち: 'ti',
    つ: 'tu',
    て: 'te',
    と: 'to',
    な: 'na',
    に: 'ni',
    ぬ: 'nu',
    ね: 'ne',
    の: 'no',
    は: 'ha',
    ひ: 'hi',
    ふ: 'hu',
    へ: 'he',
    ほ: 'ho',
    ま: 'ma',
    み: 'mi',
    む: 'mu',
    め: 'me',
    も: 'mo',
    や: 'ya',
    ゆ: 'yu',
    よ: 'yo',
    ら: 'ra',
    り: 'ri',
    る: 'ru',
    れ: 're',
    ろ: 'ro',
    わ: 'wa',
    を: 'wo',
    ん: 'nn',
    A: 'zz',
});
// リンク集
const numSelection = Object.freeze({
    //あ: 21,
    //い: 10,
    //う: 7,
    //え: 5,
    お: 14,
    か: 20,
    き: 14,
    く: 8,
    け: 8,
    こ: 17,
    さ: 11,
    し: 35,
    す: 5,
    せ: 21,
    そ: 6,
    た: 12,
    ち: 8,
    つ: 5,
    て: 8,
    と: 11,
    な: 6,
    に: 9,
    ぬ: 1,
    ね: 2,
    の: 3,
    は: 17,
    ひ: 10,
    ふ: 14,
    へ: 4,
    ほ: 7,
    ま: 6,
    み: 6,
    む: 4,
    め: 3,
    も: 4,
    や: 5,
    ゆ: 6,
    よ: 6,
    ら: 3,
    り: 3,
    る: 1,
    れ: 2,
    ろ: 3,
    わ: 7,
    A: 1,
});
/*
 メイン
*/
// ウィンドウ定義
let mainWindow;
// 起動確認フラグ
let isQuiting;
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
            //mainWindow.webContents.openDevTools();
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
        logger.debug('err: electron thread');
        // エラー
        logger.error(e);
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
        for await (const key of Object.keys(linkSelection)) {
            try {
                logger.debug(`process: getting ${key} 行`);
                // 開始位置
                const startLine = 6;
                // 対象数
                const childLength = numSelection[key];
                // 開始位置が最大数より小さい
                if (childLength >= startLine) {
                    logger.debug(`total is ${childLength}`);
                    // 合計取得数更新
                    event.sender.send('total', childLength * 50);
                    // 取得中URL
                    event.sender.send('pageUpdate', `${key} 行`);
                    logger.debug('doPageScrape mode');
                    // 対象url
                    const urls = Object.values(linkSelection);
                    // ループ用
                    const pages = makeNumberRange(1, urls.length);
                    // ループ用
                    const nums = makeNumberRange(startLine, childLength + 1);
                    // 収集ループ
                    for await (const i of pages) {
                        // データあり
                        for await (const j of nums) {
                            try {
                                // 対象URL
                                const aozoraUrl = `${DEF_AOZORA_URL}${urls[i - 1]}${j}.html`;
                                logger.debug(`process: scraping ${aozoraUrl}`);
                                // トップへ
                                await puppScraper.doGo(aozoraUrl);
                                // 1秒ウェイト
                                await puppScraper.doWaitFor(1000);
                                // 詳細ページ
                                logger.debug('doUrlScrape mode');
                                // ループ用
                                const links = makeNumberRange(FIRST_PAGE_ROWS, MAX_PAGE_ROWS);
                                // 収集ループ
                                for await (const k of links) {
                                    try {
                                        // セレクタ
                                        const finalLinkSelector = `body > center > table.list > tbody > tr:nth-child(${k}) > td:nth-child(2) > a`;
                                        // 2秒ウェイト
                                        await puppScraper.doWaitFor(2000);
                                        // 対象が存在する
                                        if (await puppScraper.doCheckSelector(finalLinkSelector)) {
                                            logger.debug(`process: downloading No.${k - 1}`);
                                            // wait and click
                                            await Promise.all([
                                                // 1秒ウェイト
                                                await puppScraper.doWaitFor(1000),
                                                // url
                                                await puppScraper.doClick(finalLinkSelector),
                                                // 2秒ウェイト
                                                await puppScraper.doWaitFor(2000),
                                            ]);
                                            // get href
                                            const zipHref = await puppScraper.getHref(zipLinkSelector);
                                            // 対象url
                                            logger.debug(zipHref);
                                            if (zipHref.includes('.zip')) {
                                                await Promise.all([
                                                    // 1秒ウェイト
                                                    await puppScraper.doWaitFor(1000),
                                                    // wait for datalist
                                                    await puppScraper.doWaitSelector(zipLinkSelector, 3000),
                                                    // zipダウンロード
                                                    await puppScraper.doClick(zipLinkSelector),
                                                    // 3秒ウェイト
                                                    await puppScraper.doWaitFor(3000),
                                                    // 前に戻る
                                                    await puppScraper.doGoBack(),
                                                ]);
                                                // 成功
                                                successCounter++;
                                            }
                                            else {
                                                // 結果
                                                logger.error('err4: not zip file');
                                                throw new Error('err4: not zip file');
                                            }
                                        }
                                        else {
                                            // 結果
                                            logger.debug('err4: no download link');
                                            throw new Error('err4: no download link');
                                        }
                                    }
                                    catch (e) {
                                        // エラー
                                        logger.debug('err4: download thread loop');
                                        logger.error(e);
                                        // 失敗
                                        failCounter++;
                                        // 前に戻る
                                        await puppScraper.doGoBack();
                                    }
                                    finally {
                                        // 取得中URL
                                        event.sender.send('statusUpdate', `process: downloading No.${k - 1}`);
                                        // 合計取得数更新
                                        event.sender.send('update', {
                                            success: successCounter,
                                            fail: failCounter,
                                        });
                                    }
                                }
                                // 1秒ウェイト
                                await puppScraper.doWaitFor(1000);
                            }
                            catch (e) {
                                // エラー
                                logger.debug('err3: scrape thread loop');
                                logger.error(e);
                            }
                        }
                    }
                }
            }
            catch (e) {
                // エラー処理
                logger.debug('err1: main thread loop');
                logger.error(e);
            }
        }
        // 終了メッセージ
        showmessage('info', '取得が終わりました');
    }
    catch (e) {
        // エラー処理
        logger.debug('err1: main thread');
        logger.error(e);
    }
    finally {
        // スクレイパー閉じる
        await puppScraper.doClose();
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
        // エラー処理
        logger.debug('err2: exit thread');
        logger.error(e);
    }
});
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
        // エラー
        logger.debug('err5: show message thread');
        logger.error(e);
    }
};
// 数字配列
const makeNumberRange = (start, end) => [...new Array(end - start).keys()].map(n => n + start);
//# sourceMappingURL=index.js.map