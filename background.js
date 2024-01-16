function incrementCounter(count) {
	getCounter().then((counter) => {
		chrome.storage.local.set({ counter: counter + count });
	});
}
function getCounter() {
	return chrome.storage.local.get('counter').then((data) => {
		return data.counter ?? 0;
	});
}

chrome.commands.onCommand.addListener((command) => {
	if (command === 'copy-all') {
		getCurrentTabId().then((tabId) => {
			chrome.tabs.sendMessage(tabId, { action: 'copy-all' }, (allCode) => {
				incrementCounter(getLOC(allCode));
				console.log(allCode);
			});
		});
	}
});

chrome.runtime.onMessage.addListener((req, info, cb) => {
	if (req.action === 'send-code') {
		incrementCounter(getLOC(req.code));
	}
	if (req.action === 'get-count') {
		getCounter().then((counter) => {
			cb(counter);
		});
		return true;
	}
});

function getLOC(code) {
	return code.split('\n').length;
}

async function getCurrentTabId() {
	let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab.id;
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
	if (reason === 'install') {
		chrome.tabs.create({
			url: chrome.runtime.getURL('welcome.html'),
		});
		chrome.runtime.setUninstallURL('https://head0223.github.io/copyPaster/leave.html');
	}
});
