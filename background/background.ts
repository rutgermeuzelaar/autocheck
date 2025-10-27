async function getCarInfo(signPlate: string) {
    const url = `https://opendata.rdw.nl/api/odata/v4/m9d7-ebf2?$filter=kenteken%20eq%20'${signPlate}'`
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
        return null
    }
}

function cacheGeneralCarInfo(generalCarInfo: any) {

}

async function requestGeneralCarInfo(signPlate: string) {
    const result = await browser.storage.session.get(signPlate)

    if (result === undefined) {
        const generalCarInfo = await getCarInfo(signPlate)
        if (generalCarInfo === null) {
            return null
        }
        await browser.storage.session.set({[signPlate]: generalCarInfo})
        return generalCarInfo
    } else {
        return result
    }
}

function listener(message: any, sender: browser.runtime.MessageSender, sendResponse: any) {
    console.log(message)
    const messageType: string = message.content[0]
    console.log(messageType)
    switch (messageType) {
        case "SIGNPLATE":
            (async () => {
                const signPlate: string = message.content[1]
                const generalCarInfo = await getCarInfo(signPlate)
                if (generalCarInfo === null) {
                    sendResponse({content: ["ERROR"]})
                }
                await browser.storage.session.set({currentSignPlate: signPlate})
                await browser.storage.session.set({[signPlate]: generalCarInfo})
                sendResponse({content: ["OK"]})
            })()
            return true
        case "GET_GENERALCARINFO":
            (async () => {
                const currentSignPlate = await browser.storage.session.get("currentSignPlate")
                const result = await requestGeneralCarInfo(currentSignPlate.currentSignPlate)
                sendResponse({content: ["RECV_GENERALCARINFO", result]})
            })()
            return true
    }
    return false
}

browser.runtime.onMessage.addListener(listener)