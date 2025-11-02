(function () {
    console.log("Marktplaats auto is running...")
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

    async function main() {
        signPlate = await waitSignPlate()
        signPlate = signPlate.trim().replaceAll("-", "")
        if (signPlate.length === 0) {
            return
        }
        try {
            browser.runtime.sendMessage({content: ["SIGNPLATE", signPlate]})
        } catch (error) {
            console.log(error)
        }
    }

    if ((window as any).hasRun) {
        return
    }
    (window as any).hasRun = true
    main()
})()