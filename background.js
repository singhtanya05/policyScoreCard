// Ensure compromise.js is loaded
importScripts('libs/compromise.min.js');

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "privacyPolicyLink") {
        const privacyPolicyUrl = message.data;
        console.log("Received privacy policy link: " + privacyPolicyUrl);

        // After fetching the privacy policy content
        fetch(privacyPolicyUrl)
            .then(response => response.text())
            .then(text => {
                console.log("Fetched privacy policy content.");
                const analysisResult = analyzePrivacyPolicyWithNLP(text);
                // Log the individual properties of the result
                console.log("Analysis result score: ", analysisResult.score);
                console.log("Analysis result details: ", analysisResult.details);

                // Store the privacy score and details in chrome.storage
                chrome.storage.local.set({
                    privacyScore: analysisResult.score,
                    privacyDetails: analysisResult.details
                }, () => {
                    // Verify that data has been stored successfully
                    chrome.storage.local.get(['privacyScore', 'privacyDetails'], (result) => {
                        console.log("Stored in storage: ", result);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching privacy policy:', error);
            });

    }
});




function analyzePrivacyPolicyWithNLP(policyText) {
    const doc = nlp(policyText);

    const dataCollection = doc.match("(data|information) (we|we collect|we gather)").out('text');
    const thirdPartySharing = doc.match("(third party|third-party|advertiser|affiliate)").out('text');
    const userRights = doc.match("(right|rights|gdpr|ccpa)").out('text');
    const retention = doc.match("(retain|data retention|how long)").out('text');
    const security = doc.match("(security|encryption|secure)").out('text');

    let score = 100;
    const details = [];

    if (!dataCollection) {
        score -= 20;
        details.push("No clear mention of data collection practices.");
    }
    if (!thirdPartySharing) {
        score -= 25;
        details.push("No mention of third-party data sharing.");
    }
    if (!userRights) {
        score -= 20;
        details.push("No mention of user rights such as GDPR or CCPA.");
    }
    if (!retention) {
        score -= 15;
        details.push("No mention of data retention policies.");
    }
    if (!security) {
        score -= 20;
        details.push("No mention of security practices like encryption.");
    }

    return {
        score: score,
        details: details.length > 0 ? details.join(" ") : "Privacy policy covers all important aspects."
    };
}
