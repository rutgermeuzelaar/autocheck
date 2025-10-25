console.log("Marktplaats auto is running...")
// Maybe I'm doing something wrong but from testing this feels slow and inconsistent, probably because there are a lot of elements
// var xpath = "//following::div[preceding::text()='Kenteken']"
// var match = document.evaluate(xpath, document, null, XPathResult.STRING_TYPE, null).stringValue


var signPlate = null

function findSignPlate() {
    for (const div of document.querySelectorAll("div")) {
        if (div.textContent.includes("Kenteken") && div.className.includes("CarAttributesTabs-itemLabel") && div.nextSibling !== null) {
            return div.nextSibling.textContent 
        }
    }
    return null
}

async function waitSignPlate() {
    return new Promise((resolve) => {
        signPlate = findSignPlate()
        if (signPlate !== null) {
            resolve(signPlate)
        } 
        else {
            const observerCallback = (mutationList, observer) => {
                signPlate = findSignPlate()
                if (signPlate !== null) {
                    observer.disconnect()
                    resolve(signPlate)
                }
            }
            const observer = new MutationObserver(observerCallback)
            const config = { childList: true, subtree: true}
            observer.observe(document.body, config)
        }
    })
}

async function main() {
    const thePlate = await waitSignPlate()
    console.log(thePlate)
}

main()