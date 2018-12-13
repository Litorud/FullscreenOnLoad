browser.runtime.sendMessage({
	method: "fullscreen"
});

addEventListener("unload", function () {
	browser.runtime.sendMessage({
		method: "revert"
	});
});