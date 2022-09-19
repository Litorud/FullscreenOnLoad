(async function () {
	// 保存されている設定を読み込む。
	let registeredContentScript

	loadUris()

	async function loadUris() {
		let storageResult
		try {
			storageResult = await browser.storage.sync.get('uris')
		} catch (ex) {
			console.log(ex)
			return
		}

		const promise = browser.contentScripts.register({
			js: [{ file: '/content_scripts/main.js' }],
			matches: storageResult.uris,
			runAt: 'document_start'
		})

		// pushState() による変更も検知してフルスクリーンにする。
		// uris は match pattern (https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns)。
		// *://*/*みたいな感じ。
		// UrlFilter (https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter) に変換する。
		// urlMatches を使う。
		const patterns = storageResult.uris.map(uri => {
			// 正規表現のエスケープは string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')。
			// https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions
			// だが、* だけ .* にする。
			return uri.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')
		})
		const regExps = patterns.map(p => new RegExp(p))

		browser.webNavigation.onHistoryStateUpdated.addListener(details => {
			if (details.transitionType.endsWith('subframe')) {
				return
			}

			browser.tabs.executeScript(details.tabId, { file: '/content_scripts/main.js' })

			// // uris にマッチしなくなったらフルスクリーンを解除する。
			browser.webNavigation.onHistoryStateUpdated.addListener(revertCallback)

			function revertCallback(details) {
				if (details.transitionType.endsWith('subframe')) {
					return
				}

				if (regExps.every(regExp => !regExp.test(details.url))) {
					browser.webNavigation.onHistoryStateUpdated.removeListener(revertCallback)
					revert()
				}
			}
		}, {
			url: patterns.map(p => ({ urlMatches: p })) // [{,}] なら AND、[{}, {}] なら OR。
		})

		registeredContentScript = await promise
	}

	// コンテントスクリプトの求めに応じて、フルスクリーンにしたり戻したりする。
	let prevState, windowId

	browser.runtime.onMessage.addListener(message => {
		switch (message.method) {
			case 'fullscreen':
				toFullscreen()
				break
			case 'revert':
				revert()
				break
		}
	})

	async function toFullscreen() {
		const window = await browser.windows.getCurrent()
		if (window.state != 'fullscreen') {
			prevState = window.state
			windowId = window.id
			browser.windows.update(windowId, {
				state: 'fullscreen'
			})
		}
	}

	function revert() {
		browser.windows.update(windowId, {
			state: prevState ? prevState : 'normal'
		})
	}

	// 設定が変更されたら読み込み直す。
	browser.storage.onChanged.addListener(() => {
		registeredContentScript?.unregister()
		loadUris()
	})
})()