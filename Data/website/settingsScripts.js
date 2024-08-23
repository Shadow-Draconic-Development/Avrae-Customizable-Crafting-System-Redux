document.getElementById('toggleDarkMode').addEventListener('click', function() {
    const body = document.body;

    // Toggle dark mode manually
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
});

// Apply the system theme on load or use the saved theme from localStorage
window.addEventListener('load', function() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // If there is a saved theme, use it
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    } else {
        // Otherwise, use the system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', prefersDark);
    }
});

// Function to add a new threshold pair
function addThresholdPair() {
    const thresholdContainer = document.getElementById('thresholdContainer');
    const newPair = document.createElement('div');
    newPair.classList.add('thresholdPair');

    newPair.innerHTML = `
        <input type="number" placeholder="Threshold" class="threshold">
        <input type="number" placeholder="Value" class="value">
        <button type="button" class="removeThreshold">Remove</button>
    `;

    thresholdContainer.appendChild(newPair);
}

// Function to add a new channel ID input
function addChannelInput() {
    const channelsContainer = document.getElementById('whitelistedChannelsContainer');
    const newPair = document.createElement('div');
    newPair.classList.add('channelPair');

    newPair.innerHTML = `
        <input type="text" placeholder="Channel ID" class="whitelistedChannel">
        <button type="button" class="removeChannel">Remove</button>
    `;

    channelsContainer.appendChild(newPair);
}

// Add initial threshold and channel ID pair on page load
document.getElementById('addThresholdButton').addEventListener('click', addThresholdPair);
document.getElementById('addChannelButton').addEventListener('click', addChannelInput);

// Function to remove a threshold pair or channel ID
document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('removeThreshold')) {
        event.target.parentElement.remove();
    }
    if (event.target && event.target.classList.contains('removeChannel')) {
        event.target.parentElement.remove();
    }
});

document.getElementById('generateJsonButton').addEventListener('click', function() {
    const settings = {};

    // Function to add a boolean setting if not null
    function addBooleanSetting(key, elementId) {
        const value = document.getElementById(elementId).value;
        if (value !== "null") {
            settings[key] = value === "true";
        }
    }

    addBooleanSetting("lfg_integration", "lfgIntegration");
    addBooleanSetting("pro_rate_refund", "proRateRefund");
    addBooleanSetting("reliable_talent", "reliableTalent");
    addBooleanSetting("parent_channel_inherit", "parentChannelInherit");
    addBooleanSetting("xp_categories", "xpCategories");

    // Add success_mod_threshold
    const successModThresholds = {};
    document.querySelectorAll('.thresholdPair').forEach(pair => {
        const threshold = pair.querySelector('.threshold').value;
        const value = pair.querySelector('.value').value;
        if (threshold && value) {
            successModThresholds[threshold] = Number(value);
        }
    });
    if (Object.keys(successModThresholds).length > 0) {
        settings.success_mod_threshold = successModThresholds;
    }

    // Add whitelisted_channel_ids
    const whitelistedChannels = [];
    document.querySelectorAll('.whitelistedChannel').forEach(input => {
        const value = input.value.trim();
        if (value) {
            whitelistedChannels.push(value);
        }
    });
    if (whitelistedChannels.length > 0) {
        settings.whitelisted_channel_ids = whitelistedChannels;
    }

    const jsonString = JSON.stringify(settings, null, 4);
    document.getElementById('output').innerText = jsonString;

    // Copy to clipboard without formatting and encase in single quotes
    const unformattedJsonString = JSON.stringify(settings);
    const singleQuotedJsonString = `'${unformattedJsonString}'`;
    navigator.clipboard.writeText(singleQuotedJsonString).then(() => {
        alert('JSON copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});
