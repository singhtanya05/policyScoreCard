function updateScore() {
    // Get the current tab's base URL (origin)
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const currentUrl = new URL(tabs[0].url).origin;  // Get the base URL

        chrome.storage.local.get({ history: {} }, (result) => {
            const history = result.history;
            // const score = siteData.privacyScore || 0; // Get the score

            // // Update the score with color based on the value
            // const scoreElement = document.getElementById("score");
            // scoreElement.textContent = score;

            // // Set the color based on the score
            // if (score > 70) {
            //     scoreElement.style.color = "#2ecc71"; // Green for scores above 70
            // } else if (score > 45) {
            //     scoreElement.style.color = "#f1c40f"; // Yellow for scores above 45
            // } else {
            //     scoreElement.style.color = "#e74c3c"; // Red for remaining scores
            // }

            if (history[currentUrl]) {
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

// Initial call to update score when popup opens
updateScore();

// Listen for background script notification when analysis is complete
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "analysisComplete") {
        const analyzedUrl = new URL(message.url).origin;  // Extract the base URL of the analyzed site
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            const tabUrl = new URL(tabs[0].url).origin;
            if (tabUrl === analyzedUrl) {
                updateScore();  // Refresh the score and breakdown for the current site
            }
        });
    }
});

// Button to show history
document.getElementById("history-button").addEventListener("click", () => {
    chrome.storage.local.get('history', (result) => {
        const history = result.history || {};
        let historyList = '';

        for (const [url, data] of Object.entries(history)) {
            historyList += `Website: ${url} - Score: ${data.privacyScore}\n`;
        }

        alert(historyList || 'No history available.');
    });
});
