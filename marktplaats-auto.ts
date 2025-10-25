interface IDictionary {
    [index:string]: any
}

console.log("Marktplaats auto is running...")
// Maybe I'm doing something wrong but from testing this feels slow and inconsistent, probably because there are a lot of elements
// var xpath = "//following::div[preceding::text()='Kenteken']"
// var match = document.evaluate(xpath, document, null, XPathResult.STRING_TYPE, null).stringValue


var signPlate = null

function findSignPlate() {
    for (const div of document.querySelectorAll("div")) {
        if (
            div.textContent !== null &&
            div.textContent.includes("Kenteken") && 
            div.className.includes("CarAttributesTabs-itemLabel") && 
            div.nextSibling !== null
        ) {
            return div.nextSibling.textContent 
        }
    }
    return null
}

async function waitSignPlate(): Promise<string> {
    return new Promise((resolve) => {
        signPlate = findSignPlate()
        if (signPlate !== null) {
            resolve(signPlate)
        } 
        else {
            const observerCallback = (mutationList: MutationRecord[], observer: MutationObserver) => {
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

function carIsImported(carInfo: IDictionary): boolean {
    if (carInfo["datum_eerste_toelating"] !== carInfo["datum_eerste_tenaamstelling_in_nederland"]) {
        return true;
    }
    return false;
}

async function getCarInfo(signPlate: string) {
    // const url = "https://opendata.rdw.nl/api/odata/v4/m9d7-ebf2?$filter=kenteken%20eq%20%2799NBF9%27"
    const url = `https://opendata.rdw.nl/api/odata/v4/m9d7-ebf2?$filter=kenteken%20eq%20'${signPlate.trim()}'`
    console.log(url)
    const response = await fetch(
        url, {
            headers: {
                "OData-Version": "4.0",
                "OData-MaxVersion": "4.0"
            }
        }
    )
    if (response.ok) {
        const json = await response.json()
        return json["value"][0]
    }
    else {
        console.log(response.statusText)
    }
}

async function main() {
    signPlate = await waitSignPlate()
    signPlate = signPlate.trim().replaceAll("-", "")
    console.log(signPlate)
    try {
        const carInfo: IDictionary = await getCarInfo(signPlate)
        console.log(carInfo)
        console.log(`tellerstandoordeel: ${carInfo["tellerstandoordeel"]}`)
        console.log(`Importauto: ${carIsImported(carInfo) ? 'Ja': 'Nee'}`)
    } catch (error) {
        console.log(error)
    }
}

main()