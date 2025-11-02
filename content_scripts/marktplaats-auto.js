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
(function () {
    console.log("Marktplaats auto is running...");
    var signPlate = null;
    function findSignPlate() {
        for (const div of document.querySelectorAll("div")) {
            if (div.textContent !== null &&
                div.textContent.includes("Kenteken") &&
                div.className.includes("CarAttributesTabs-itemLabel") &&
                div.nextSibling !== null) {
                return div.nextSibling.textContent;
            }
        }
        return null;
    }
    function waitSignPlate() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                signPlate = findSignPlate();
                if (signPlate !== null) {
                    resolve(signPlate);
                }
                else {
                    const observerCallback = (mutationList, observer) => {
                        signPlate = findSignPlate();
                        if (signPlate !== null) {
                            observer.disconnect();
                            resolve(signPlate);
                        }
                    };
                    const observer = new MutationObserver(observerCallback);
                    const config = { childList: true, subtree: true };
                    observer.observe(document.body, config);
                }
            });
        });
    }
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            signPlate = yield waitSignPlate();
            signPlate = signPlate.trim().replaceAll("-", "");
            if (signPlate.length === 0) {
                return;
            }
            try {
                browser.runtime.sendMessage({ content: ["SIGNPLATE", signPlate] });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;
    main();
})();
