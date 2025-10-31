interface IDictionary {
    [index:string]: any
}

function reportExecuteScriptError(error: any) {
    console.error(error.message)
}

   
function notify(message: any) {
    const messageType = message.content[0]

    console.log(`popup: ${messageType}`)
    if (messageType !== "GET_GENERALCARINFO") {
        return;
    }
    console.log("Message received...")
    console.log(message)
    // const ele = document.getElementById("tellerstandoordeel")
    // if (ele !== null) {
    //     ele.textContent = message.info["tellerstandoordeel"]
    // }
}

function carIsImported(carInfo: IDictionary): boolean {
    if (carInfo["datum_eerste_toelating"] !== carInfo["datum_eerste_tenaamstelling_in_nederland"]) {
        return true;
    }
    return false;
}

browser.runtime.onMessage.addListener(notify)
browser.runtime.sendMessage({content: ["GET_GENERALCARINFO"]})
    .then(response => {
        const messageType = response.content[0]
        console.log(`messageType: ${messageType}`)
        if (messageType !== "RECV_GENERALCARINFO") {
            return
        }
        const generalCarInfo = Object.values(response.content[1])[0] as IDictionary
        generalCarInfo.import = generalCarInfo["datum_eerste_toelating"] !== generalCarInfo["datum_eerste_tenaamstelling_in_nederland"] ? "Ja" : "Nee"
        const generalCarAttributes = Object.keys(generalCarInfo)
		// set license plate on top
		const licensePlateElement = document.getElementById("kenteken-input")
		if (licensePlateElement !== null) {
			licensePlateElement.setAttribute("value", generalCarInfo["kenteken"])
		}
		// update attributes
        generalCarAttributes.forEach((carAttribute) => {
            console.log(`${carAttribute}: ${generalCarInfo[carAttribute]}`)
            const foundElement = document.getElementById(carAttribute)
            if (foundElement !== null) {
                if (carAttribute === "vervaldatum_apk") {
                    const unformattedDate = String(generalCarInfo[carAttribute])
                    const formattedDate = unformattedDate.slice(6, 8) + "-" + unformattedDate.slice(4, 6) + "-" + unformattedDate.slice(0, 4)
                    foundElement.textContent = formattedDate
                }
                else {
                    foundElement.textContent = generalCarInfo[carAttribute]
                }
            }
        })
        console.log("Setting popup elements...")
    })
