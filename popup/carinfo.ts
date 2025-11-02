interface IDictionary {
    [index:string]: any
}

function reportExecuteScriptError(error: any) {
    console.error(error.message)
}

function carIsImported(carInfo: IDictionary): boolean {
    if (carInfo["datum_eerste_toelating"] !== carInfo["datum_eerste_tenaamstelling_in_nederland"]) {
        return true;
    }
    return false;
}

function isAlpha(char: string) {
    return ((char >= "a" && char <= "z") || (char >= "A" && char <= "Z"))
}

function isDigit(char: string) {
    return (char >= "0" && char <= "9")
}

function formatLicensePlate(licensePlate: string): string {
    let i = 0
    let formattedLicensePlate = licensePlate

    if (licensePlate.length !== 6) {
        throw new Error("License plate must contain 6 characters")
    }
    while (i < 6) {
        let cpy = i
        let func = isAlpha
        if (isDigit(formattedLicensePlate[i])) {
            func = isDigit
        }
        i++
        while (i < formattedLicensePlate.length && func(formattedLicensePlate[i])) {
            i++
        }
        if (i !== cpy) {
            const diff = i - cpy
            // 99-XX-XX
            // XX-XX-99
            if (diff === 4) {
                formattedLicensePlate = formattedLicensePlate.slice(0, i-2) + "-" + formattedLicensePlate.slice(i-2, formattedLicensePlate.length)
            }
            else {
                formattedLicensePlate = formattedLicensePlate.slice(0, i) + "-" + formattedLicensePlate.slice(i, formattedLicensePlate.length)
            }
            i++
        }
    }
    return formattedLicensePlate
}

function updatePopup(response: any) {
    const generalCarInfo = Object.values(response.content[1])[0] as IDictionary
    generalCarInfo.import = generalCarInfo["datum_eerste_toelating"] !== generalCarInfo["datum_eerste_tenaamstelling_in_nederland"] ? "Ja" : "Nee"
    generalCarInfo.bouwjaar = String(generalCarInfo["datum_eerste_toelating_dt"]).slice(0,4)
    const generalCarAttributes = Object.keys(generalCarInfo)
    // set license plate on top
    const licensePlateElement = document.getElementById("kenteken-input")
    if (licensePlateElement !== null) {
        licensePlateElement.setAttribute("value", formatLicensePlate(generalCarInfo["kenteken"]))
    }
    // update attributes
    console.log("Setting popup elements...")
    generalCarAttributes.forEach((carAttribute) => {
        console.log(`${carAttribute}: ${generalCarInfo[carAttribute]}`)
        const foundElement = document.getElementById(carAttribute)
        if (foundElement !== null) {
            foundElement.textContent = generalCarInfo[carAttribute]
            if (carAttribute === "vervaldatum_apk") {
                const unformattedDate = String(generalCarInfo[carAttribute])
                const formattedDate = unformattedDate.slice(6, 8) + "-" + unformattedDate.slice(4, 6) + "-" + unformattedDate.slice(0, 4)
                foundElement.textContent = formattedDate
            }
            else if (carAttribute === "tellerstandoordeel") {
                const oordeel = String(generalCarInfo["tellerstandoordeel"])
                switch (oordeel) {
                    case "Logisch":
                        foundElement.classList.add("format-good")
                        break;
                    case "Onlogisch":
                        foundElement.classList.add("format-bad")
                        break;
                    case "Geen oordeel":
                        foundElement.classList.add("format-neutral")
                }
            }
            else if (carAttribute === "import") {
                switch (generalCarInfo.import) {
                    case "Ja":
                        foundElement.classList.add("format-neutral")
                        break;
                    case "Nee":
                        foundElement.classList.add("format-good")
                        break;
                }
            }
        }
    })   
}

const searchButton = document.querySelector("#kenteken-search")

if (searchButton !== null) {
    searchButton.addEventListener("click", (event) => {
        const licensePlateElement: HTMLInputElement | null = document.querySelector("#kenteken-input")
        if (licensePlateElement === null) {
            return
        }
        console.log("From popup")
        console.log(licensePlateElement.value)
        const licensePlate = licensePlateElement.value.trim().replaceAll("-", "")
        console.log(licensePlate)
        browser.runtime.sendMessage({content: ["SIGNPLATE", licensePlate]})
        .then((response) => {
            console.log(response)
            browser.runtime.sendMessage({content: ["GET_GENERALCARINFO"]})
            .then((res) => {updatePopup(res)})})
    })
}

async function main() {
    const response = await browser.runtime.sendMessage({content: ["GET_GENERALCARINFO"]})
    const messageType = response.content[0]
    console.log(`messageType: ${messageType}`)
    if (messageType !== "RECV_GENERALCARINFO") {
        return
    }
    updatePopup(response)
}

main()
