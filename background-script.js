(async function () {
	// 保存されている設定を読み込む。
	let registeredContentScript;

	async function loadUris() {
		let storageResult;
		try {
			storageResult = await browser.storage.sync.get("uris");
		} catch (ex) {
			console.log(ex);
			return;
		}

		registeredContentScript = await browser.contentScripts.register({
			"js": [{ file: "/content_scripts/main.js" }],
			"matches": storageResult.uris
		});
	}

	loadUris();

	let prevState;

	// コンテントスクリプトの求めに応じて、フルスクリーンにしたり戻したりする。
	browser.runtime.onMessage.addListener(function (message) {
		switch (message.method) {
			case "fullscreen":
				toFullscreen();
				break;
			case "revert":
				revert();
				break;
		}
	});

	async function toFullscreen() {
		const window = await browser.windows.getCurrent();
		prevState = window.state;

		browser.windows.update(window.id, {
			state: "fullscreen"
		});
	}

	function revert() {
		browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
			state: prevState ? prevState : "normal"
		});
	}

	// 設定が変更されたら読み込み直す。
	browser.storage.onChanged.addListener(function () {
		registeredContentScript.unregister();
		loadUris();
	});
})()