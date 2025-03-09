// Device model aliases for Huawei and Honor devices
const MODEL_ALIASES = {
    "ANA-LX9": "Huawei P40",
    "ANA-NX9": "Huawei P40 Pro",
    "ELS-NX9": "Huawei P40 Pro+",
    "JNY-LX1": "Huawei nova 7",
    "JEF-LX1": "Huawei Enjoy 20 Plus 5G",
    "HLK-LX1": "Huawei nova 8i",
    "DRA-LX9": "Huawei Mate 40 Pro",
    "NOH-AN00": "Huawei Mate 40 Pro+",
    "PGU-LX1": "Huawei P50",
    "PGU-AN00": "Huawei P50 Pro",
    "VOG-LX9": "Huawei nova 9",
    "EVE-LX9": "Huawei nova Y61",
    "BRQ-LX1": "Huawei nova 10",
    "BRQ-AN00": "Huawei nova 10 Pro",
    "LNA-LX1": "Huawei nova Y70",
    "ALP-LX9": "Huawei Mate X2",
    "LGI-LX3": "Huawei Mate Xs 2",
    "HMA-LX9": "Huawei Mate 50 Pro",
    "CDY-L21": "Huawei nova 11",
    "LON-LX1": "Huawei nova 12",
    "LON-AN00": "Huawei nova 12 Pro",
    "NOV-LX9": "Huawei nova 13",
    "NOV-AN00": "Huawei nova 13 Pro",
    "ANE-LX1": "Huawei nova 7i",
    "TET-LX3": "Honor 30",
    "NOH-LX1": "Honor 30 Pro+",
    "CDY-LX1": "Honor 50",
    "CDY-AN00": "Honor 50 5G",
    "TET-AN00": "Honor 30 5G",
    "ELY-LX9": "Honor Magic 4",
    "ELY-AN00": "Honor Magic 4 5G",
    "PGZ-AN00": "Honor Magic 4 Pro",
    "MRD-LX1": "Honor Magic 5",
    "MRD-AN00": "Honor Magic 5 Pro",
    "VNE-LX1": "Honor Magic 5 Lite",
    "LGE-AN00": "Honor Magic 6",
    "LGE-LX1": "Honor Magic 6 Pro",
    "VNE-LX3": "Honor Magic 6 Lite",
    "HOB-AN00": "Honor Magic 7",
    "HOB-LX1": "Honor Magic 7 Pro",
    "NTH-AN00": "Honor Magic 7 Lite",
    "PHA-LX1": "Honor 60",
    "PHA-AN00": "Honor 60 Pro",
    "DAB-AN00": "Honor 70",
    "DAB-LX1": "Honor 70 5G",
    "LRA-AN00": "Honor 80",
    "LRA-LX1": "Honor 80 5G",
    "MAA-LX1": "Honor 90",
    "MAA-AN00": "Honor 90 Pro",
    "NTH-LX1": "Honor 90 Lite",
    "XKG-AN00": "Honor X8",
    "XKG-LX1": "Honor X8 5G",
    "XKM-AN10": "Honor X9",
    "XKM-LX1": "Honor X9 5G",
    "YKG-LX1": "Honor X10",
    "YKG-AN10": "Honor X10 5G",
    "ZAD-LX1": "Honor Play 20",
    "ZAD-AN00": "Honor Play 20 5G",
    "FNE-AN00": "Honor Magic V",
    "FNE-LX1": "Honor Magic V 5G",
    "PSN-LX1": "Honor Magic V2",
    "PSN-AN00": "Honor Magic V2 5G",
    "QTF-AN00": "Honor Magic V3",
    "QTF-LX1": "Honor Magic V3 5G",
    "JAD-LX1": "Honor Play 5",
    "JAD-AN00": "Honor Play 5 5G",
    "KSA-LX1": "Honor X20",
    "KSA-AN00": "Honor X20 5G",
    "LUA-AN00": "Honor X30",
    "LUA-LX1": "Honor X30 5G",
    "MWD-AN10": "Honor X40",
    "MWD-LX1": "Honor X40 5G",
    "NOA-AN00": "Honor X50",
    "NOA-LX1": "Honor X50 5G",
};

let adbInstance = null;
let isConnected = false;

// Function to connect to the device using WebUSB and ADB
async function connectDevice() {
    try {
        let webusb = await Adb.open("WebUSB");
        adbInstance = await webusb.connectAdb("host::");
        isConnected = true;
        return true;
    } catch (e) {
        console.error("Connection error:", e);
        isConnected = false;
        return false;
    }
}

// Function to retrieve device information using ADB commands
async function getDeviceInfo() {
    if (!adbInstance) return { model: "Unknown", serial: "Unknown" };
    try {
        let shell = await adbInstance.shell("getprop ro.product.model");
        let model = (await shell.receive()).trim();
        shell = await adbInstance.shell("getprop ro.serialno");
        let serial = (await shell.receive()).trim();
        return { model, serial };
    } catch (e) {
        console.error("Error getting device info:", e);
        return { model: "Unknown", serial: "Unknown" };
    }
}

// Function to check device connection and update UI
async function checkDeviceConnection() {
    if (isConnected) {
        updateDeviceInfo();
        return;
    }

    const connected = await connectDevice();
    const indicator = document.querySelector(".connection-indicator");
    const text = document.querySelector(".connection-text");
    const progress = document.querySelector("#connectionProgress");

    if (connected) {
        indicator.style.color = "#00E676";
        text.textContent = "DEVICE CONNECTED";
        text.style.color = "#00E676";
        let value = parseInt(progress.style.width || "0");
        if (value < 100) {
            value = Math.min(value + 50, 100);
            progress.style.width = `${value}%`;
            if (value < 100) {
                setTimeout(checkDeviceConnection, 500);
            }
        }
        if (value === 100) updateDeviceInfo();
    } else {
        resetUI();
    }
}

// Function to reset the UI to its initial state
function resetUI() {
    isConnected = false;
    adbInstance = null;
    document.querySelector(".connection-indicator").style.color = "#FF5252";
    document.querySelector(".connection-text").textContent = "AWAITING DEVICE CONNECTION";
    document.querySelector(".connection-text").style.color = "#B0BEC5";
    document.querySelector("#connectionProgress").style.width = "0%";
    document.querySelector(".operation-text").textContent = "READY";
    document.querySelector("#frpKeyInput").value = "";
    document.querySelector("#unlockProgress").style.display = "none";
    document.querySelector("#unlockProgress").style.width = "0%";
    document.querySelector(".bottom-status").textContent = "SYSTEM READY • WAITING FOR DEVICE CONNECTION";
    clearDeviceInfo();
}

// Function to clear the device information section
function clearDeviceInfo() {
    const imageFrame = document.getElementById("imageFrame");
    const infoFrame = document.getElementById("infoFrame");
    imageFrame.innerHTML = "<p>No device connected.</p>";
    infoFrame.innerHTML = "";
}

// Function to update the device info section with new data
async function updateDeviceInfo() {
    clearDeviceInfo();
    const { model, serial } = await getDeviceInfo();
    const imageFrame = document.getElementById("imageFrame");
    const infoFrame = document.getElementById("infoFrame");

    if (MODEL_ALIASES[model]) {
        const commercialName = MODEL_ALIASES[model];
        const imageName = commercialName.replace(" ", "_").replace("+", "plus");
        imageFrame.innerHTML = `<img src="Honor_Images/${imageName}.png" alt="${commercialName}" style="max-width:250px;border:2px solid #64FFDA;border-radius:10px;">`;
    }

    infoFrame.innerHTML = `
        <div><label>Product Model:</label> ${model} <button onclick="navigator.clipboard.writeText('${model}')">Copy</button></div>
        ${MODEL_ALIASES[model] ? `<div><label>Commercial Name:</label> ${MODEL_ALIASES[model]} <button onclick="navigator.clipboard.writeText('${MODEL_ALIASES[model]}')">Copy</button></div>` : ""}
        <div><label>Serial Number:</label> ${serial} <button onclick="navigator.clipboard.writeText('${serial}')">Copy</button></div>
    `;
    document.querySelector(".bottom-status").textContent = "DEVICE INFO LOADED SUCCESSFULLY";
    setTimeout(() => document.querySelector(".bottom-status").textContent = "READY", 3000);
}

// Function to manually refresh device information
async function refreshDeviceInfo() {
    document.querySelector("#connectionProgress").style.width = "0%";
    document.querySelector(".bottom-status").textContent = "REFRESHING DEVICE INFORMATION...";
    resetUI();
    checkDeviceConnection();
}

// Function to reboot the connected device
async function rebootDevice() {
    if (!isConnected || !adbInstance) {
        alert("No device connected. Please connect a device.");
        return;
    }
    document.querySelector(".operation-text").textContent = "REBOOTING DEVICE";
    document.querySelector(".bottom-status").textContent = "SENDING REBOOT COMMAND...";
    let shell = await adbInstance.shell("reboot");
    await shell.receive();
    document.querySelector(".bottom-status").textContent = "DEVICE REBOOT COMMAND SENT SUCCESSFULLY";
    alert("Device reboot command sent successfully!");
    document.querySelector(".operation-text").textContent = "READY";
    resetUI();
}

// Function to unlock FRP protection using the provided key
async function unlockFRP() {
    const frpKey = document.getElementById("frpKeyInput").value.trim();
    if (!frpKey) return alert("Please enter a valid FRP unlock key.");
    if (!isConnected || !adbInstance) {
        alert("No device connected. Please connect a device.");
        return;
    }

    const progress = document.getElementById("unlockProgress");
    progress.style.display = "block";
    document.querySelector(".operation-text").textContent = "UNLOCKING FRP";
    document.querySelector(".bottom-status").textContent = "INITIALIZING FRP UNLOCK PROCEDURE...";

    for (let step = 1; step <= 4; step++) {
        setTimeout(() => updateUnlockProgress(step * 20), step * 500);
    }
    setTimeout(() => executeFRPUnlock(frpKey), 2500);
}

// Function to update the unlock progress bar
function updateUnlockProgress(value) {
    const progress = document.getElementById("unlockProgress");
    progress.style.width = `${value}%`;
    const status = document.querySelector(".bottom-status");
    if (value === 20) status.textContent = "VALIDATING FRP KEY...";
    else if (value === 40) status.textContent = "PREPARING DEVICE FOR UNLOCK...";
    else if (value === 60) status.textContent = "SENDING UNLOCK COMMAND...";
    else if (value === 80) status.textContent = "FINALIZING UNLOCK PROCEDURE...";
}

// Function to execute the FRP unlock command
async function executeFRPUnlock(frpKey) {
    try {
        const shell = await adbInstance.shell(`echo "${frpKey}" > /data/system/frp_unlock_key.txt`);
        await shell.receive();
        document.getElementById("unlockProgress").style.width = "100%";
        document.querySelector(".bottom-status").textContent = "FRP UNLOCK COMPLETED SUCCESSFULLY";
        alert("FRP protection has been successfully removed from your device!");
        setTimeout(() => document.getElementById("unlockProgress").style.display = "none", 3000);
        document.querySelector(".operation-text").textContent = "READY";
        setTimeout(refreshDeviceInfo, 1500);
    } catch (e) {
        document.getElementById("unlockProgress").style.width = "0%";
        document.getElementById("unlockProgress").style.display = "none";
        document.querySelector(".bottom-status").textContent = "FRP UNLOCK ERROR";
        alert(`An error occurred during FRP unlock: ${e.message}`);
        document.querySelector(".operation-text").textContent = "ERROR";
    }
}

// Automatically attempt to connect when the page loads
document.addEventListener("DOMContentLoaded", () => {
    checkDeviceConnection();
});
