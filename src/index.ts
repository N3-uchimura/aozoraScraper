/*
 * index.ts
 *
 * function：Node.js server
 **/

// import global interface
import { } from '../@types/globalobj';

// 定数
const FIRST_PAGE_ROWS: number = 2;
const MAX_PAGE_ROWS: number = 52;
const DEF_AOZORA_URL: string = 'https://www.aozora.gr.jp/index_pages/sakuhin_'; // スクレイピング対象サイトルート
const CSV_ENCODING: string = 'SJIS'; // csv文字コード
const CHOOSE_FILE: string = '読み込むCSVを選択してください。'; // ファイルダイアログ

// import modules
import { config as dotenv } from 'dotenv'; // dotenv
import { BrowserWindow, app, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'path'; // path
import { promises } from 'fs'; // fs
import { parse } from 'csv-parse/sync'; // parse
import iconv from 'iconv-lite'; // Text converter
import { Scrape } from './class/myScraper0429el'; // scraper
import ELLogger from './class/MyLogger0301el'; // logger

import { stringify } from 'csv-stringify/sync';

// ファイル読み込み用
const { readFile, writeFile } = promises;

// ログ設定np
const logger: ELLogger = new ELLogger('../../logs', 'access');
// スクレイピング用
const puppScraper: Scrape = new Scrape();

// 環境変数
dotenv({ path: path.join(__dirname, '../.env') });

// list(作品一覧)
const fixLinkSelector: string = 'body > center > table.list > tbody > ';
// 次へセレクタ
const fixNextSelector: string = 'body > table > tbody > tr > td:nth-child(2)';
// zipリンク)
const zipLinkSelector: string = 'body > table.download > tbody > tr:nth-child(2) > td:nth-child(3) > a';
// desktopパス取得
const dir_home = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] ?? '';
const dir_desktop = path.join(dir_home, 'Desktop');

// リンク集
const linkSelection: any = Object.freeze({
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
})

/*
 メイン
*/
// ウィンドウ定義
let mainWindow: Electron.BrowserWindow;
// 起動確認フラグ
let isQuiting: boolean;
// 最終配列
let finalResultArray: any = [];

// ウィンドウ作成
const createWindow = (): void => {
    try {
        // ウィンドウ
        mainWindow = new BrowserWindow({
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
            // mainWindow.webContents.openDevTools();
        });

        // 最小化のときはトレイ常駐
        mainWindow.on('minimize', (event: any): void => {
            // キャンセル
            event.preventDefault();
            // ウィンドウを隠す
            mainWindow.hide();
            // falseを返す
            event.returnValue = false;
        });

        // 閉じる
        mainWindow.on('close', (event: any): void => {
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
        mainWindow.on('closed', (): void => {
            // ウィンドウをクローズ
            mainWindow.destroy();
        });

    } catch (e: unknown) {
        // エラー処理
        if (e instanceof Error) {
            // メッセージ表示
            logger.error(`${e.message})`);
        }
    }
}

// サンドボックス有効化
app.enableSandbox();

// 処理開始
app.on('ready', async () => {
    logger.info('app: electron is ready');
    // ウィンドウを開く
    createWindow();
    // アイコン
    const icon: Electron.NativeImage = nativeImage.createFromPath(path.join(__dirname, '../assets/aozora.ico'));
    // トレイ
    const mainTray: Electron.Tray = new Tray(icon);
    // コンテキストメニュー
    const contextMenu: Electron.Menu = Menu.buildFromTemplate([
        // 表示
        {
            label: '表示', click: () => {
                mainWindow.show();
            }
        },
        // 閉じる
        {
            label: '閉じる', click: () => {
                app.quit();
            }
        }
    ]);
    // コンテキストメニューセット
    mainTray.setContextMenu(contextMenu);
    // ダブルクリックで再表示
    mainTray.on('double-click', () => mainWindow.show());
});

// 起動時
app.on('activate', () => {
    // 起動ウィンドウなし
    if (BrowserWindow.getAllWindows().length === 0) {
        // 再起動
        createWindow();
    }
});

// 閉じるボタン
app.on('before-quit', () => {
    // 閉じるフラグ
    isQuiting = true;
});

// 終了
app.on('window-all-closed', () => {
    logger.info('app: close app');
    // 閉じる
    app.quit();
});

/*
 IPC
*/
// スクレイピング
ipcMain.on('scrape', async (event: any, _: any) => {
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
            // 次への数
            const linkcount: number = await puppScraper.doCountChildren(fixNextSelector);
            // 合計取得数更新
            event.sender.send('total', linkcount);
            // 取得中URL
            event.sender.send('statusUpdate', `${key} 行`);
        }
        // 終了メッセージ
        showmessage('info', '取得が終わりました');

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// スクレイピング停止
ipcMain.on('pause', async () => {
    try {
        logger.info('ipc: pause mode');
        // 質問項目
        const options: Electron.MessageBoxSyncOptions = {
            type: 'question',
            title: '質問',
            message: '終了',
            detail: '終了してよろしいですか？これまでのデータはCSVに書き出されます。',
            buttons: ['はい', 'いいえ'],
            cancelId: -1, // Escで閉じられたときの戻り値
        }
        // 選んだ選択肢
        const selected: number = dialog.showMessageBoxSync(options);

        // はいを選択
        if (selected == 0) {
            // 現在時刻
            const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;
            // CSVファイル名
            const targetpath: string = `${nowtime}.csv`;
            // CSV書き出し
            await makeCsvData(finalResultArray, targetpath);
            // 終了メッセージ
            showmessage('info', '処理を中断しました');

        } else {
            return false;
        }

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// スクレイピング停止
ipcMain.on('exit', async () => {
    try {
        logger.info('ipc: exit mode');
        // 質問項目
        const options: Electron.MessageBoxSyncOptions = {
            type: 'question',
            title: '質問',
            message: '終了',
            detail: '終了してよろしいですか？これまでのデータは破棄されます。',
            buttons: ['はい', 'いいえ'],
            cancelId: -1, // Escで閉じられたときの戻り値
        }
        // 選んだ選択肢
        const selected: number = dialog.showMessageBoxSync(options);

        // はいを選択
        if (selected == 0) {
            // 閉じる
            app.quit();
        }

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// do page scraping
const doPageScrape = async (linkcnt: number): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 成功数
            let successCounter: number = 0;
            // 失敗数
            let failCounter: number = 0;
            // promises
            let pagePromises: Promise<void>[] = [];

            // 収集ループ
            for (let i = 1; i < linkcnt + 1; i++) {
                // ページセレクタ
                const bookLinkSelector: string = `${fixNextSelector} > a:nth-child(${i})`;

                // wait for datalist
                await puppScraper.doWaitSelector(bookLinkSelector, 3000);

                // 対象が存在する
                if (await puppScraper.doCheckSelector(bookLinkSelector)) {
                    // 最初のページ以外
                    if (i > 1) {
                        // wait and click
                        await Promise.all([
                            // wait
                            await puppScraper.doWaitForNav(1000),
                            // ページ番号クリック
                            await puppScraper.doClick(bookLinkSelector),
                        ]);

                    } else {
                        // 収集ループ
                        for (let j = FIRST_PAGE_ROWS; j < MAX_PAGE_ROWS + 2; j++) {
                            // 結果収集
                            const result: Promise<void> = doUrlScrape(j);
                            // 結果格納
                            pagePromises.push(result);
                        }
                    }
                }
            }
            // 結果
            resolve(pagePromises);

        } catch (e) {
            // 結果 
            reject('error');
        }
    });
}

// do url scraping
const doUrlScrape = async (index: number): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            // セレクタ
            const listLinkSelector: string = `tr:nth-child(${index}) > td:nth-child(2) > a`;
            // 最終セレクタ
            const finalLinkSelector: string = fixLinkSelector + listLinkSelector;
            // promises
            let urlPromises: Promise<any>[] = [];

            // wait for datalist
            await puppScraper.doWaitSelector(finalLinkSelector, 3000);

            // 対象が存在する
            if (await puppScraper.doCheckSelector(finalLinkSelector)) {
                logger.info(`searching for ${index}`);
                // wait and click
                await Promise.all([
                    // wait
                    await puppScraper.doWaitForNav(1000),
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
                        await puppScraper.doWaitForNav(1000),
                        // zipダウンロード
                        await puppScraper.doClick(zipLinkSelector),
                    ]);
                    // zipダウンロード完了
                    resolve();
                }

            } else {
                // 結果
                logger.debug('no selector');
                reject('error');
            }

        } catch (e) {
            // 結果 
            reject('error');
        }
    });
}

// do book downloading
const doBookDownload = async (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            // promises
            let bookPromises: Promise<string>[] = [];
            // selector
            const metaSelecter: string = 'body > div.metadata';
            const bookSelecter: string = 'body > div.main_text';

            // 対象が存在する
            if (await puppScraper.doCheckSelector(metaSelecter) && await puppScraper.doCheckSelector(bookSelecter)) {
                const megaResult: string = await puppScraper.doSingleEval(metaSelecter,);
            }


            // 結果
            resolve(urlPromises);

        } catch (e) {
            // 結果 
            reject('error');
        }
    });
}

// CSV抽出
const getCsvData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            logger.info('func: getCsvData mode');
            // ファイル選択ダイアログ
            dialog.showOpenDialog({
                properties: ['openFile'], // ファイル
                title: CHOOSE_FILE, // ファイル選択
                defaultPath: '.', // ルートパス
                filters: [
                    { name: 'csv(Shif-JIS)', extensions: ['csv'] }, // csvのみ
                ],

            }).then(async (result: any) => {
                // ファイルパス
                const filenames: string[] = result.filePaths;

                // ファイルあり
                if (filenames.length) {
                    // ファイル読み込み
                    const csvdata: any = await readFile(filenames[0]);
                    // デコード
                    const str: string = iconv.decode(csvdata, CSV_ENCODING);

                    // csvパース
                    const tmpRecords: string[][] = parse(str, {
                        columns: false, // カラム設定なし
                        from_line: 2, // 開始行無視
                        skip_empty_lines: true, // 空白セル無視
                    });

                    // 値返し
                    resolve({
                        record: tmpRecords, // データ
                        filename: filenames[0], // ファイル名
                    });

                } else {
                    // ファイルなし
                    reject(result.canceled);
                }

            }).catch((err: unknown) => {
                // エラー型
                if (err instanceof Error) {
                    // エラー
                    logger.error(err.message);
                }
            });

        } catch (e: unknown) {
            // エラー型
            if (e instanceof Error) {
                // エラー
                logger.error(e.message);
                reject(e.message);
            }
        }
    });
}

// CSV抽出
const makeCsvData = (arr: any[], filename: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info('func: makeCsvData mode');
            // csvdata
            const csvData: any = stringify(arr, { header: true });
            // 書き出し
            await writeFile(filename, iconv.encode(csvData, 'shift_jis'));

            // ウィンドウを閉じる
            await puppScraper.doClose();
            // 完了
            resolve();

        } catch (e: unknown) {
            // エラー型
            if (e instanceof Error) {
                // エラー
                logger.error(e.message);
                reject();
            }
        }

    });
}

// メッセージ表示
const showmessage = async (type: string, message: string): Promise<void> => {
    try {
        // モード
        let tmpType: 'none' | 'info' | 'error' | 'question' | 'warning' | undefined;
        // タイトル
        let tmpTitle: string | undefined;

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
        const options: Electron.MessageBoxOptions = {
            type: tmpType, // タイプ
            message: tmpTitle, // メッセージタイトル
            detail: message,  // 説明文
        }
        // ダイアログ表示
        dialog.showMessageBox(options);

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー
            logger.error(e.message);
        }
    }
}
