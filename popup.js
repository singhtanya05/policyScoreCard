// Fetch and display the privacy score and details from storage
// Fetch and display the privacy score and details from storage
function updateScore() {
    chrome.storage.local.get(['privacyScore', 'privacyDetails'], (result) => {
        if (result.privacyScore !== undefined) {
            document.getElementById("score").textContent = result.privacyScore;
            document.getElementById("details").textContent = result.privacyDetails;

            // Update individual breakdowns
            document.getElementById("dataCollection").textContent = result.dataCollection || "Not mentioned";
            document.getElementById("thirdPartySharing").textContent = result.thirdPartySharing || "Not mentioned";
            document.getElementById("userRights").textContent = result.userRights || "Not mentioned";
            document.getElementById("dataRetention").textContent = result.dataRetention || "Not mentioned";
            document.getElementById("security").textContent = result.security || "Not mentioned";
        }
    });

}

// Update score immediately if available
updateScore();

// Listen for background script notification when analysis is complete
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "analysisComplete") {
        // When background sends notification, update the score
        updateScore();
    }
});



document.getElementById("rate-button").addEventListener("click", () => {
    const userRating = prompt("Please rate the privacy practices on this site (1-5):");

    if (userRating >= 1 && userRating <= 5) {
        console.log("User rating submitted:", userRating); // Log the user rating

        // Store the user's rating in chrome.storage (you can enhance this further)
        chrome.storage.local.set({ userRating: userRating });
        alert(`Thank you for rating! Your rating: ${userRating}`);
    } else {
        alert("Invalid rating. Please enter a number between 1 and 5.");
    }
});
