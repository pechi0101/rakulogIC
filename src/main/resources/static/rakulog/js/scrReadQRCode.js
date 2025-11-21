const statusEl  = document.getElementById('status');
const resultEl  = document.getElementById('result');
const startBtn  = document.getElementById('startNfcBtn');

let abortController = null;

//document.addEventListener("DOMContentLoaded", () => {
//    startNfcReading();   // ← 画面起動時に自動で NFC 読取り開始
//});


// ------------------------------------------------
// Web NFC 対応チェック
//function isSupportedWebNfc() {
//  return 'NDEFReader' in window;
//}

// ------------------------------------------------
// 開始ボタン押下処理
startBtn.addEventListener('click', async () => {

	// NFC が使えるかチェック
	if (!("NDEFReader" in window)) {
		alert("このスマホはＩＣタグ読み取りに対応していません");
		return;
	}
	
	// 既存の scan があれば止める
	//if (abortController) {
	//	 abortController.abort();
	//}
	
	try {
		const ndef = new NDEFReader();
		statusEl.textContent = '状態: 読取り待機中...';
		
		// スキャン開始
		await ndef.scan();
		
		// タグ検出時のイベント
		ndef.addEventListener("reading", event => {
			const { serialNumber, message } = event;
			
			let log = '';
			log += `タグ検出: シリアル番号 = ${serialNumber}\n`;
			log += '--- レコード一覧 ---\n';
			
			var readindTextRecord = "";
			
			// １つのNFCタグに複数のレコード（※）が入っている可能性があるためLOOP処理
			// ※NDEFメッセージ
			//   +レコード１(例：テキスト)
			//   +レコード２(例：URL)
			//   +レコード３(例：画像などのバイナリデータ)
			for (const record of message.records) {
				log += `recordType: ${record.recordType}\n`;
				log += `mediaType : ${record.mediaType ?? '(なし)'}\n`;
				
				// テキストレコード（よくあるパターン）
				if (record.recordType === "text") {
					const textDecoder = new TextDecoder(record.encoding || "utf-8");
					const text = textDecoder.decode(record.data);
					log += `text      : ${text}\n`;
					
					// ■本システムではテキストのみを想定。取得したらLOOP脱出。
					readindTextRecord = text;
					break;
				}
				// URL レコード
				else if (record.recordType === "url") {
					const textDecoder = new TextDecoder();
					const url = textDecoder.decode(record.data);
					log += `url       : ${url}\n`;
				}
				else {
					// 汎用（バイナリ）レコード
					const textDecoder = new TextDecoder();
					const dataStr = textDecoder.decode(record.data);
					log += `data(raw) : ${dataStr}\n`;
				}
				
				log += '------------------------\n';
			}
			
			resultEl.textContent = log;
			statusEl.textContent = '状態: 読み取りに成功しました。';
			
			// 読取った内容をセットしてサーバ処理起動
			qrcode.value = readindTextRecord
			
			
			// ローカルストレージに画面表示「許可」の状態を書き込む 
			//
			// ■ブラウザバック防止施策
			// ------------------------------------------------
			// 【やりたいコト】
			// 以下画面②へブラウザバックで戻ってこれないようにする
			// ①データを書き込む画面の遷移元画面
			// ②データを書き込む画面
			// 
			// 【施策】
			// indexQR画面表示時：ローカルストレージを「不許可」にする
			// 画面①→②遷移時：ローカルストレージを「許可」にする
			// 画面②表示前：ローカルストレージが「許可」  である場合、画面表示処理を行い、  表示処理終了後にローカルストレージを「不許可」に戻す
			// 画面②表示前：ローカルストレージが「不許可」である場合、画面表示処理を行わず、indexQR画面に強制的に遷移させられる
			//          ▼
			// 画面②のボタン押下などでデータを書き込んだあと別画面に遷移
			// ブラウザバックで画面②に戻った際、ローカルストレージが「不許可」になっているためindexQR画面に強制的に遷移する 
			// ------------------------------------------------
			// 
			// ■ローカルストレージの設定例(true：許可、false：不許可)
			// localStorage.setItem("localStorage_IsDispScreen"  ,"false");
			localStorage.setItem("localStorage_IsDispScreen"  ,"true");
			
			
			//データをサーバのSpringBootにPOST送信
			//formRegist.submit();
			
			
		});
		
		// エラー時（ユーザーがキャンセルした / 権限拒否など）
		ndef.addEventListener("readingerror", () => {
			statusEl.textContent = '状態: タグを読み取れませんでした。もう一度かざしてみてください。';
		});
		
	} catch (err) {
		console.error(err);
		statusEl.textContent = `状態: エラーが発生しました: ${err.message}`;
	}
});

