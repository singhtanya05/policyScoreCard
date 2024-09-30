// Ensure compromise.js is loaded
importScripts('libs/compromise.min.js');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "privacyPolicyLink") {
        const privacyPolicyUrl = new URL(message.data).origin;  // Use the base URL (origin)

        // Fetch the privacy policy content
        fetch(message.data)
            .then(response => response.text())
            .then(text => {
                const analysisResult = analyzePrivacyPolicyWithNLP(text);

                // Store privacy score and breakdown specific to this base URL
                chrome.storage.local.get({ history: {} }, (result) => {
                    const history = result.history;

                    // Store the analysis result for this specific base URL
                    history[privacyPolicyUrl] = {
                        privacyScore: analysisResult.score,
                        privacyDetails: analysisResult.details,
                        dataCollection: analysisResult.dataCollection,
                        thirdPartySharing: analysisResult.thirdPartySharing,
                        userRights: analysisResult.userRights,
                        dataRetention: analysisResult.dataRetention,
                        security: analysisResult.security
                    };

                    // Save the updated history object
                    console.log('Storing data for base URL:', privacyPolicyUrl, history[privacyPolicyUrl]);
                    chrome.storage.local.set({ history: history }, () => {
                        console.log('Data stored successfully');
                        // Notify the popup that the analysis is complete for this base URL
                        chrome.runtime.sendMessage({ action: "analysisComplete", url: privacyPolicyUrl });
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
