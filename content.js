// Curated timezone display mapping - optimized for global coverage
const timezoneDisplay = {
    // Core UTC
    "UTC": "Coordinated Universal Time (UTC)",

    // United States (Major Zones)
    "America/New_York": "Eastern Time (US & Canada) (EST/EDT)",
    "America/Chicago": "Central Time (US & Canada) (CST/CDT)",
    "America/Denver": "Mountain Time (US & Canada) (MST/MDT)",
    "America/Los_Angeles": "Pacific Time (US & Canada) (PST/PDT)",

    // Europe
    "Europe/London": "Greenwich Mean Time (GMT/BST)",
    "Europe/Paris": "Central European Time (CET/CEST)",

    // Asia - Major
    "Asia/Tokyo": "Japan Standard Time (JST)",

    // Southeast Asia (Complete Coverage)
    "Asia/Bangkok": "Indochina Time (Bangkok, Thailand) (ICT)",
    "Asia/Ho_Chi_Minh": "Indochina Time (Ho Chi Minh City, Vietnam) (ICT)",
    "Asia/Jakarta": "Western Indonesia Time (Jakarta) (WIB)",
    "Asia/Singapore": "Singapore Time (SGT)",
    "Asia/Kuala_Lumpur": "Malaysia Time (MYT)",
    "Asia/Manila": "Philippine Time (PHT)",
    "Asia/Phnom_Penh": "Indochina Time (Phnom Penh, Cambodia) (ICT)",
    "Asia/Vientiane": "Indochina Time (Vientiane, Laos) (ICT)",
    "Asia/Brunei": "Brunei Darussalam Time (BNT)",
    "Asia/Makassar": "Central Indonesia Time (Makassar) (WITA)",
    "Asia/Jayapura": "Eastern Indonesia Time (Jayapura) (WIT)",
    "Asia/Yangon": "Myanmar Time (MMT)",

    // Africa
    "Africa/Johannesburg": "South Africa Standard Time (SAST)",

    // Canada (Major Cities)
    "America/Toronto": "Eastern Time (Toronto, Canada) (EST/EDT)",
    "America/Vancouver": "Pacific Time (Vancouver, Canada) (PST/PDT)",
    "America/Edmonton": "Mountain Time (Edmonton, Canada) (MST/MDT)",
    "America/Winnipeg": "Central Time (Winnipeg, Canada) (CST/CDT)",
    "America/Halifax": "Atlantic Time (Halifax, Canada) (AST/ADT)",
    "America/St_Johns": "Newfoundland Time (St. John's, Canada) (NST/NDT)",

    // Australia (Major Cities)
    "Australia/Sydney": "Australian Eastern Time (Sydney, Australia) (AEST/AEDT)",
    "Australia/Melbourne": "Australian Eastern Time (Melbourne, Australia) (AEST/AEDT)",
    "Australia/Brisbane": "Australian Eastern Time (Brisbane, Australia) (AEST)",
    "Australia/Adelaide": "Australian Central Time (Adelaide, Australia) (ACST/ACDT)",
    "Australia/Perth": "Australian Western Time (Perth, Australia) (AWST)",
    "Australia/Darwin": "Australian Central Time (Darwin, Australia) (ACST)",
    "Australia/Hobart": "Australian Eastern Time (Hobart, Australia) (AEST/AEDT)"
};

// List of IANA timezones (now curated to 34 zones)
const timezones = Object.keys(timezoneDisplay);

// Create the timezone selector UI with friendly names
function createTimezoneSelector(selectedTz) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.background = '#fff';
    container.style.border = '1px solid #ccc';
    container.style.padding = '8px';
    container.style.zIndex = 9999;
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    container.style.fontSize = '14px';
    container.style.borderRadius = '4px';
    container.style.minWidth = '300px';
    container.style.maxWidth = '400px';

    const label = document.createElement('label');
    label.textContent = 'Timezone: ';
    label.htmlFor = 'tz-select';
    label.style.fontWeight = 'bold';

    const select = document.createElement('select');
    select.id = 'tz-select';
    select.style.width = '100%';
    select.style.marginTop = '4px';
    select.style.padding = '4px';

    timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        // Show the friendly name instead of the IANA name
        option.textContent = timezoneDisplay[tz] || tz;
        if (tz === selectedTz) option.selected = true;
        select.appendChild(option);
    });

    select.addEventListener('change', function() {
        setTimezone(select.value);
    });

    container.appendChild(label);
    container.appendChild(select);
    document.body.appendChild(container);
}

// Set the timezone cookie and update displays
function setTimezone(tz) {
    document.cookie = `browser_timezone=${encodeURIComponent(tz)}; path=/; max-age=31536000`;
    localStorage.setItem('timeshot_selected_tz', tz);
    updateDisplays(tz);
}

// Update the timezone and offset displays - FIXED VERSION
function updateDisplays(tz) {
    // Update timezone display
    const tzElem = document.getElementById('user-tz');
    if (tzElem) tzElem.textContent = tz;

    // Calculate offset for the selected timezone - IMPROVED METHOD
    try {
        const now = new Date();

        // Use a more reliable method to get timezone offset
        const formatter = new Intl.DateTimeFormat('en', {
            timeZone: tz,
            timeZoneName: 'longOffset'
        });

        const parts = formatter.formatToParts(now);
        const offsetPart = parts.find(part => part.type === 'timeZoneName');

        if (offsetPart && offsetPart.value !== tz) {
            // Use the formatted offset directly
            const offsetElem = document.getElementById('user-offset');
            if (offsetElem) offsetElem.textContent = offsetPart.value;
        } else {
            // Fallback to manual calculation with proper rounding
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
            const offsetMinutes = (localDate - utcDate) / 60000;

            // Round to nearest 15 minutes (most timezones are in 15-minute increments)
            const roundedOffsetMinutes = Math.round(offsetMinutes / 15) * 15;

            const sign = roundedOffsetMinutes >= 0 ? '+' : '-';
            const absMinutes = Math.abs(roundedOffsetMinutes);
            const hours = Math.floor(absMinutes / 60);
            const minutes = absMinutes % 60;
            const offsetString = 'UTC' + sign + hours + (minutes === 0 ? '' : ':' + String(minutes).padStart(2, '0'));

            const offsetElem = document.getElementById('user-offset');
            if (offsetElem) offsetElem.textContent = offsetString;
        }
    } catch (e) {
        // Fallback: try to get offset using getTimezoneOffset
        try {
            const tempDate = new Date();
            const utcTime = tempDate.getTime() + (tempDate.getTimezoneOffset() * 60000);
            const targetTime = new Date(utcTime + (0 * 3600000)); // This is a simplified fallback

            const offsetElem = document.getElementById('user-offset');
            if (offsetElem) offsetElem.textContent = 'UTC+0'; // Safe fallback
        } catch (fallbackError) {
            // Ultimate fallback: do nothing
        }
    }
}

// On page load
(function() {
    const savedTz = localStorage.getItem('timeshot_selected_tz') || Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(savedTz);
    createTimezoneSelector(savedTz);
})();
