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
function getCarInfo(signPlate) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://opendata.rdw.nl/api/odata/v4/m9d7-ebf2?$filter=kenteken%20eq%20'${signPlate}'`;
        const response = yield fetch(url, {
            headers: {
                "OData-Version": "4.0",
                "OData-MaxVersion": "4.0"
            }
        });
        if (response.ok) {
            const json = yield response.json();
            return json["value"][0];
        }
        else {
            console.log(response.statusText);
            return null;
        }
    });
}
function cacheGeneralCarInfo(generalCarInfo) {
}
function requestGeneralCarInfo(signPlate) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield browser.storage.session.get(signPlate);
        if (result === undefined) {
            const generalCarInfo = yield getCarInfo(signPlate);
            if (generalCarInfo === null) {
                return null;
            }
            yield browser.storage.session.set({ [signPlate]: generalCarInfo });
            return generalCarInfo;
        }
        else {
            return result;
        }
    });
}
function listener(message, sender, sendResponse) {
    console.log(message);
    const messageType = message.content[0];
    console.log(messageType);
    switch (messageType) {
        case "SIGNPLATE":
            (() => __awaiter(this, void 0, void 0, function* () {
                const signPlate = message.content[1];
                const generalCarInfo = yield getCarInfo(signPlate);
                if (generalCarInfo === null) {
                    sendResponse({ content: ["ERROR"] });
                }
                yield browser.storage.session.set({ currentSignPlate: signPlate });
                yield browser.storage.session.set({ [signPlate]: generalCarInfo });
                sendResponse({ content: ["OK"] });
            }))();
            return true;
        case "GET_GENERALCARINFO":
            (() => __awaiter(this, void 0, void 0, function* () {
                const currentSignPlate = yield browser.storage.session.get("currentSignPlate");
                const result = yield requestGeneralCarInfo(currentSignPlate.currentSignPlate);
                sendResponse({ content: ["RECV_GENERALCARINFO", result] });
            }))();
            return true;
    }
    return false;
}
browser.runtime.onMessage.addListener(listener);
