/**
 * globalobj.d.ts
 **
 * function：グローバル宣言
**/

export { };

declare global {
    // 収集結果
    interface urlinfodata {
        urls: string[];
        success: number;
        fail: number;
    }
}