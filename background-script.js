let prevState;

browser.runtime.onMessage.addListener(function(message) {
	switch (message.method) {
	case "fullscreen":
		browser.windows.getCurrent().then(toFullscreen);
		break;
	case "revert":
		revert();
		break;
	}

	function toFullscreen(window) {
		prevState = window.state;

		browser.windows.update(window.id, {
			state : "fullscreen"
		});
	}

	function revert() {
		browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
			state : prevState ? prevState : "normal"
		});
	}
});
