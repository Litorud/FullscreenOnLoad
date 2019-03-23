function saveOptions(e) {
    e.preventDefault();

    const urisText = document.querySelector("#uris").value;
    const uris = urisText.trim().split(/\s/);

    browser.storage.sync.set({
        uris: uris
    });
}

async function restoreOptions() {
    let storageResult;
    try {
        storageResult = await browser.storage.sync.get("uris");
    } catch (ex) {
        console.log(`Error: ${ex}`);
    }

    const uris = storageResult.uris;
    document.querySelector("#uris").value = uris ? uris.join("\n") : "https://www.youtube.com/watch?*";
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);