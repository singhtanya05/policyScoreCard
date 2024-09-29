// Extract the privacy policy URL from the page
function getPrivacyPolicyLink() {
    const links = document.querySelectorAll('a[href]');
    const privacyLinks = Array.from(links).filter(link =>
        link.href.toLowerCase().includes('privacy') || link.textContent.toLowerCase().includes('privacy')
    );

    if (privacyLinks.length > 0) {
        return privacyLinks[0].href;
    }
    return null;
}

// Send the privacy policy link to the background script
const privacyPolicyLink = getPrivacyPolicyLink();
if (privacyPolicyLink) {
    chrome.runtime.sendMessage({ action: "privacyPolicyLink", data: privacyPolicyLink });
} else {
    console.log("No privacy policy found on this page.");
}
