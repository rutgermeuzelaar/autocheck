"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function reportExecuteScriptError(error) {
    console.error(error.message);
}
function carIsImported(carInfo) {
    if (carInfo["datum_eerste_toelating"] !== carInfo["datum_eerste_tenaamstelling_in_nederland"]) {
        return true;
    }
    return false;
}
function isAlpha(char) {
    return ((char >= "a" && char <= "z") || (char >= "A" && char <= "Z"));
}
function isDigit(char) {
    return (char >= "0" && char <= "9");
}
function formatLicensePlate(licensePlate) {
    let i = 0;
    let formattedLicensePlate = licensePlate;
    if (licensePlate.length !== 6) {
        throw new Error("License plate must contain 6 characters");
    }
    while (i < 6) {
        let cpy = i;
        let func = isAlpha;
        if (isDigit(formattedLicensePlate[i])) {
            func = isDigit;
        }
        i++;
        while (i < formattedLicensePlate.length && func(formattedLicensePlate[i])) {
            i++;
        }
        if (i !== cpy) {
            const diff = i - cpy;
            // 99-XX-XX
            // XX-XX-99
            if (diff === 4) {
                formattedLicensePlate = formattedLicensePlate.slice(0, i - 2) + "-" + formattedLicensePlate.slice(i - 2, formattedLicensePlate.length);
            }
            else {
                formattedLicensePlate = formattedLicensePlate.slice(0, i) + "-" + formattedLicensePlate.slice(i, formattedLicensePlate.length);
            }
            i++;
        }
    }
    return formattedLicensePlate;
}
function updatePopup(response) {
    const generalCarInfo = Object.values(response.content[1])[0];
    generalCarInfo.import = generalCarInfo["datum_eerste_toelating"] !== generalCarInfo["datum_eerste_tenaamstelling_in_nederland"] ? "Ja" : "Nee";
    generalCarInfo.bouwjaar = String(generalCarInfo["datum_eerste_toelating_dt"]).slice(0, 4);
    const generalCarAttributes = Object.keys(generalCarInfo);
    // set license plate on top
    const licensePlateElement = document.getElementById("kenteken-input");
    if (licensePlateElement !== null) {
        licensePlateElement.setAttribute("value", formatLicensePlate(generalCarInfo["kenteken"]));
    }
    // update attributes
    console.log("Setting popup elements...");
    generalCarAttributes.forEach((carAttribute) => {
        console.log(`${carAttribute}: ${generalCarInfo[carAttribute]}`);
        const foundElement = document.getElementById(carAttribute);
        if (foundElement !== null) {
            foundElement.textContent = generalCarInfo[carAttribute];
            if (carAttribute === "vervaldatum_apk") {
                const unformattedDate = String(generalCarInfo[carAttribute]);
                const formattedDate = unformattedDate.slice(6, 8) + "-" + unformattedDate.slice(4, 6) + "-" + unformattedDate.slice(0, 4);
                foundElement.textContent = formattedDate;
            }
            else if (carAttribute === "tellerstandoordeel") {
                const oordeel = String(generalCarInfo["tellerstandoordeel"]);
                switch (oordeel) {
                    case "Logisch":
                        foundElement.classList.add("format-good");
                        break;
                    case "Onlogisch":
                        foundElement.classList.add("format-bad");
                        break;
                    case "Geen oordeel":
                        foundElement.classList.add("format-neutral");
                }
            }
            else if (carAttribute === "import") {
                switch (generalCarInfo.import) {
                    case "Ja":
                        foundElement.classList.add("format-neutral");
                        break;
                    case "Nee":
                        foundElement.classList.add("format-good");
                        break;
                }
            }
        }
    });
}
const searchButton = document.querySelector("#kenteken-search");
if (searchButton !== null) {
    searchButton.addEventListener("click", (event) => {
        const licensePlateElement = document.querySelector("#kenteken-input");
        if (licensePlateElement === null) {
            return;
        }
        console.log("From popup");
        console.log(licensePlateElement.value);
        const licensePlate = licensePlateElement.value.trim().replaceAll("-", "");
        console.log(licensePlate);
        browser.runtime.sendMessage({ content: ["SIGNPLATE", licensePlate] })
            .then((response) => {
            console.log(response);
            browser.runtime.sendMessage({ content: ["GET_GENERALCARINFO"] })
                .then((res) => { updatePopup(res); });
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield browser.runtime.sendMessage({ content: ["GET_GENERALCARINFO"] });
        const messageType = response.content[0];
        console.log(`messageType: ${messageType}`);
        if (messageType !== "RECV_GENERALCARINFO") {
            return;
        }
        updatePopup(response);
    });
}
main();
