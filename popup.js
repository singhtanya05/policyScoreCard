// Get the current tab's URL
// Get the current tab's URL
function updateScore() {
    // Get the current tab's URL
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        // const currentUrl = new URL(tabs[0].url).origin;  // Get the base URL (origin) for comparison
        const currentUrl = message.url;


        // Retrieve the score and breakdown specific to this URL
        chrome.storage.local.get({ history: {} }, (result) => {
            const history = result.history;
            console.log('Fetching score for URL:', currentUrl);
            // if (history[currentUrl]) {
            if (history[privacyPolicyUrl]) {
                console.log('Found data in history:', siteData);
                const siteData = history[currentUrl];

                document.getElementById("score").textContent = siteData.privacyScore || "No score available yet";
                document.getElementById("details").textContent = siteData.privacyDetails || "The privacy policy hasn't been analyzed yet.";

                // Update individual breakdowns
                document.getElementById("dataCollection").textContent = siteData.dataCollection || "Not mentioned";
                document.getElementById("thirdPartySharing").textContent = siteData.thirdPartySharing || "Not mentioned";
                document.getElementById("userRights").textContent = siteData.userRights || "Not mentioned";
                document.getElementById("dataRetention").textContent = siteData.dataRetention || "Not mentioned";
                document.getElementById("security").textContent = siteData.security || "Not mentioned";
            } else {
                console.log('No data found for this URL in history');
                // If the URL is not in history, show analyzing state
                document.getElementById("score").textContent = "No score available yet.";
                document.getElementById("details").textContent = "The privacy policy hasn't been analyzed yet.";
                document.getElementById("dataCollection").textContent = "Analyzing...";
                document.getElementById("thirdPartySharing").textContent = "Analyzing...";
                document.getElementById("userRights").textContent = "Analyzing...";
                document.getElementById("dataRetention").textContent = "Analyzing...";
                document.getElementById("security").textContent = "Analyzing...";
            }
        });
    });
}
updateScore();



// Listen for background script notification when analysis is complete
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "analysisComplete") {
        const currentUrl = new URL(message.url).origin;  // Extract the URL that was analyzed

        // Ensure the popup is updating only if the current page matches the analyzed URL
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            const tabUrl = new URL(tabs[0].url).origin;

            if (tabUrl === currentUrl) {
                // Refresh the score and breakdown for the analyzed URL
                updateScore();
            }
        });
    }
});




document.getElementById("history-button").addEventListener("click", () => {
    chrome.storage.local.get('history', (result) => {
        const history = result.history || {};
        let historyList = '';

        // Display history
        for (const [url, data] of Object.entries(history)) {
            historyList += `Website: ${url} - Score: ${data.privacyScore}\n`;
        }

        alert(historyList || 'No history available.');
    });
});
