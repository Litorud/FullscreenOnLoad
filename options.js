document.addEventListener("DOMContentLoaded", async function () {
    let storageResult;
    try {
        storageResult = await browser.storage.sync.get("uris");
    } catch (ex) {
        console.log(`Error: ${ex}`);
        return;
    }

    const uris = storageResult.uris;
    const form = document.forms["options"];
    const urisTextArea = form.uris;
    urisTextArea.value = uris ? uris.join("\n") : "https://www.youtube.com/watch?*";

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const uris = urisTextArea.value.trim().split(/\s+/);

        browser.storage.sync.set({
            uris: uris
        });
    });
});