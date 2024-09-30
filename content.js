// Fetch and analyze the privacy policy using NLP (compromise.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "privacyPolicyLink") {
        const privacyPolicyUrl = message.data;
        console.log("Received privacy policy link: " + privacyPolicyUrl);

        // Fetch the privacy policy content
        fetch(privacyPolicyUrl)
            .then(response => response.text())
            .then(text => {
                console.log("Fetched privacy policy content.");
                const analysisResult = analyzePrivacyPolicyWithNLP(text);
                console.log("Analysis result: ", analysisResult);

                chrome.storage.local.set({ privacyScore: analysisResult.score, privacyDetails: analysisResult.details });
            })
            .catch(error => {
                console.error('Error fetching privacy policy:', error);
            });
    }
});

// Use NLP to analyze privacy policy content using compromise.js
function analyzePrivacyPolicyWithNLP(policyText) {
    const doc = nlp(policyText);

    // Extract specific patterns and keywords
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

function getPrivacyPolicyLink() {
    const links = document.querySelectorAll('a[href]');
    const privacyLinks = Array.from(links).filter(link =>
        link.href.toLowerCase().includes('privacy') || link.textContent.toLowerCase().includes('privacy')
    );

    if (privacyLinks.length > 0) {
        console.log("Privacy policy found: " + privacyLinks[0].href);
        return privacyLinks[0].href;
    } else {
        console.log("No privacy policy found on this page.");
        return null;
    }
}

const privacyPolicyLink = getPrivacyPolicyLink();
if (privacyPolicyLink) {
    chrome.runtime.sendMessage({ action: "privacyPolicyLink", data: privacyPolicyLink });
}
