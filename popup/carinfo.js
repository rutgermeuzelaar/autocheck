"use strict";
function reportExecuteScriptError(error) {
    console.error(error.message);
}
function notify(message) {
    const messageType = message.content[0];
    console.log(`popup: ${messageType}`);
    if (messageType !== "GET_GENERALCARINFO") {
        return;
    }
    console.log("Message received...");
    console.log(message);
    // const ele = document.getElementById("tellerstandoordeel")
    // if (ele !== null) {
    //     ele.textContent = message.info["tellerstandoordeel"]
    // }
}
function carIsImported(carInfo) {
    if (carInfo["datum_eerste_toelating"] !== carInfo["datum_eerste_tenaamstelling_in_nederland"]) {
        return true;
    }
    return false;
}
browser.runtime.onMessage.addListener(notify);
browser.runtime.sendMessage({ content: ["GET_GENERALCARINFO"] })
    .then(response => {
    const messageType = response.content[0];
    console.log(`messageType: ${messageType}`);
    if (messageType !== "RECV_GENERALCARINFO") {
        return;
    }
    const generalCarInfo = Object.values(response.content[1])[0];
    generalCarInfo.import = generalCarInfo["datum_eerste_toelating"] !== generalCarInfo["datum_eerste_tenaamstelling_in_nederland"] ? "Ja" : "Nee";
    console.log(generalCarInfo.import);
    const generalCarAttributes = Object.keys(generalCarInfo);
    const carIsImported = generalCarInfo["datum_eerste_toelating"];
    console.log(carIsImported);
    generalCarAttributes.forEach((carAttribute) => {
        console.log(`${carAttribute}: ${generalCarInfo[carAttribute]}`);
        const foundElement = document.getElementById(carAttribute);
        if (foundElement !== null) {
            if (carAttribute === "vervaldatum_apk") {
                const unformattedDate = String(generalCarInfo[carAttribute]);
                const formattedDate = unformattedDate.slice(6, 8) + "-" + unformattedDate.slice(4, 6) + "-" + unformattedDate.slice(0, 4);
                foundElement.textContent = formattedDate;
            }
            else {
                foundElement.textContent = generalCarInfo[carAttribute];
            }
        }
    });
    console.log("Setting popup elements...");
});
