browser.runtime.sendMessage({
	method: 'fullscreen'
})

addEventListener('unload', () => browser.runtime.sendMessage({
	method: 'revert'
}))