// Listen for messages from content.js to analyze the privacy policy
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "privacyPolicyLink") {
        const privacyPolicyUrl = message.data;

        // Fetch and analyze the privacy policy
        fetch(privacyPolicyUrl)
            .then(response => response.text())
            .then(text => {
                const analysisResult = analyzePrivacyPolicy(text);
                chrome.storage.local.set({ privacyScore: analysisResult.score, privacyDetails: analysisResult.details });
            })
            .catch(error => {
                console.error('Error fetching privacy policy:', error);
            });
    }
});

// Analyze the content of the privacy policy using keyword matching or more advanced techniques
function analyzePrivacyPolicy(policyText) {
    // Define keywords to check against
    const keywords = {
        dataCollection: /data collection|information we collect|how we collect/i,
        thirdPartySharing: /share with third parties|third-party|advertisers|affiliates/i,
        userRights: /right to access|right to delete|gdpr|ccpa|rights/i,
        retention: /data retention|retain data|how long we keep/i,
        security: /security|encryption|secure/i
    };

    let score = 100;
    const details = [];

    // Check for presence of keywords, adjust score accordingly
    if (!keywords.dataCollection.test(policyText)) {
        score -= 20;
        details.push("No mention of data collection practices.");
    }
    if (!keywords.thirdPartySharing.test(policyText)) {
        score -= 25;
        details.push("No mention of third-party data sharing.");
    }
    if (!keywords.userRights.test(policyText)) {
        score -= 20;
        details.push("No mention of user rights (GDPR, CCPA, etc.).");
    }
    if (!keywords.retention.test(policyText)) {
        score -= 15;
        details.push("No mention of data retention policies.");
    }
    if (!keywords.security.test(policyText)) {
        score -= 20;
        details.push("No mention of security measures.");
    }

    return {
        score: score,
        details: details.length > 0 ? details.join(" ") : "Privacy policy appears thorough."
    };
}
