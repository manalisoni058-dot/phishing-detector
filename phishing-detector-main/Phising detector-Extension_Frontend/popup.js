document.addEventListener("DOMContentLoaded", async () => {

    const riskLevel = document.getElementById("riskLevel");
    const riskMessage = document.getElementById("riskMessage");
    const website = document.getElementById("website");
    const https = document.getElementById("https");
    const forms = document.getElementById("forms");
    const passwords = document.getElementById("passwords");
    const links = document.getElementById("links");
    const iframes = document.getElementById("iframes");
    const riskScore = document.getElementById("riskScore");
    const warning = document.getElementById("warning");

    try {

        riskLevel.innerText = "ANALYZING";
        riskMessage.innerText = "Checking webpage...";

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab || !tab.id) {
            throw new Error("No active tab found");
        }

        // Get data from content.js
        const features = await chrome.tabs.sendMessage(
            tab.id,
            {
                action: "analyzePage"
            }
        );

        console.log("Features received:", features);

        // Display webpage information
        website.innerText = features.domain || "Unknown";
        https.innerText = features.https ? "Yes" : "No";
        forms.innerText = features.forms;
        passwords.innerText = features.passwordFields;
        links.innerText = features.links;
        iframes.innerText = features.iframes;

        // Send URL to backend
        const response = await fetch(
            "http://localhost:5000/check-url",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: tab.url
                })
            }
        );

        const data = await response.json();

        // Display risk score
        riskScore.innerText = data.riskScore + "/100";

        riskLevel.innerText = data.result || "CHECKED";
        riskMessage.innerText = "Website analysis completed";

        if (data.riskScore >= 70) {
            warning.innerText = "⚠️ High risk website detected.";
        } else if (data.riskScore >= 40) {
            warning.innerText = "⚠️ Suspicious characteristics detected.";
        } else {
            warning.innerText = "✅ Website appears safe.";
        }

    } catch (error) {

        console.error("Extension error:", error);

        riskLevel.innerText = "ERROR";
        riskMessage.innerText = error.message;
        website.innerText = "Unable to detect";
    }
});