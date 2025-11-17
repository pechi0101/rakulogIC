const btnStart = document.getElementById('btnStart');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

// Web NFC 対応チェック
if (!('NDEFReader' in window)) {
	statusEl.textContent = '状態: このブラウザは Web NFC(NDEFReader) に対応していません。Android の Chrome で試してください。';
	btnStart.disabled = true;
}

btnStart.addEventListener('click', async () => {
	// ボタン連打防止
	btnStart.disabled = true;

	try {
		const ndef = new NDEFReader();
		statusEl.textContent = '状態: NFC 読み取りを開始しました。タグをスマホの背面に近づけてください…';
		
		// スキャン開始
		await ndef.scan();
		
		// タグ検出時のイベント
		ndef.addEventListener("reading", event => {
			const { serialNumber, message } = event;
			
			let log = '';
			log += `タグ検出: シリアル番号 = ${serialNumber}\n`;
			log += '--- レコード一覧 ---\n';
			
			for (const record of message.records) {
				log += `recordType: ${record.recordType}\n`;
				log += `mediaType : ${record.mediaType ?? '(なし)'}\n`;
				
				// テキストレコード（よくあるパターン）
				if (record.recordType === "text") {
					const textDecoder = new TextDecoder(record.encoding || "utf-8");
					const text = textDecoder.decode(record.data);
					log += `text      : ${text}\n`;
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
			statusEl.textContent = '状態: 読み取りに成功しました。もう一度読む場合は「読み取り開始」を押してください。';
			btnStart.disabled = false;
			
			// 読取った内容をセットしてサーバ処理起動
			qrcode.value = log
			
			
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
			btnStart.disabled = false;
		});
		
		
		
		
	} catch (err) {
		console.error(err);
		statusEl.textContent = `状態: エラーが発生しました: ${err.message}`;
		btnStart.disabled = false;
	}
});

