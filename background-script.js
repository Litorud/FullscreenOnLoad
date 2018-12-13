(function () {
	let prevState;

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
})()