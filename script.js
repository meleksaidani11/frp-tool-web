const MODEL_ALIASES = {
    "ANA-LX9": "Huawei P40", "ANA-NX9": "Huawei P40 Pro", /* ... والباقي من القاموس ... */
};

let adbInstance = null;

async function connectDevice() {
    try {
        let webusb = await Adb.open("WebUSB");
        adbInstance = await webusb.connectAdb("host::");
        return true;
    } catch (e) {
        console.error("Connection error:", e);
        return false;
    }
}

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

async function checkDeviceConnection() {
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
            setTimeout(checkDeviceConnection, 500);
        }
        if (value === 100) updateDeviceInfo();
    } else {
        resetUI();
    }
}

function resetUI() {
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

function clearDeviceInfo() {
    const imageFrame = document.getElementById("imageFrame");
    const infoFrame = document.getElementById("infoFrame");
    imageFrame.innerHTML = "<p>No device connected.</p>";
    infoFrame.innerHTML = "";
}

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

async function refreshDeviceInfo() {
    if (await connectDevice()) {
        document.querySelector("#connectionProgress").style.width = "0%";
        document.querySelector(".bottom-status").textContent = "REFRESHING DEVICE INFORMATION...";
        checkDeviceConnection();
    } else {
        alert("No device connected. Please connect a device.");
    }
}

async function rebootDevice() {
    if (await connectDevice()) {
        document.querySelector(".operation-text").textContent = "REBOOTING DEVICE";
        document.querySelector(".bottom-status").textContent = "SENDING REBOOT COMMAND...";
        let shell = await adbInstance.shell("reboot");
        await shell.receive();
        document.querySelector(".bottom-status").textContent = "DEVICE REBOOT COMMAND SENT SUCCESSFULLY";
        alert("Device reboot command sent successfully!");
        document.querySelector(".operation-text").textContent = "READY";
    } else {
        alert("No device connected. Please connect a device.");
    }
}

async function unlockFRP() {
    const frpKey = document.getElementById("frpKeyInput").value.trim();
    if (!frpKey) return alert("Please enter a valid FRP unlock key.");
    if (!await connectDevice()) return alert("No device connected. Please connect a device.");

    const progress = document.getElementById("unlockProgress");
    progress.style.display = "block";
    document.querySelector(".operation-text").textContent = "UNLOCKING FRP";
    document.querySelector(".bottom-status").textContent = "INITIALIZING FRP UNLOCK PROCEDURE...";

    for (let step = 1; step <= 4; step++) {
        setTimeout(() => updateUnlockProgress(step * 20), step * 500);
    }
    setTimeout(() => executeFRPUnlock(frpKey), 2500);
}

function updateUnlockProgress(value) {
    const progress = document.getElementById("unlockProgress");
    progress.style.width = `${value}%`;
    const status = document.querySelector(".bottom-status");
    if (value === 20) status.textContent = "VALIDATING FRP KEY...";
    else if (value === 40) status.textContent = "PREPARING DEVICE FOR UNLOCK...";
    else if (value === 60) status.textContent = "SENDING UNLOCK COMMAND...";
    else if (value === 80) status.textContent = "FINALIZING UNLOCK PROCEDURE...";
}

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

setInterval(checkDeviceConnection, 1000);