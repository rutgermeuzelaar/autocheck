## About
> The extension is currently only available in Dutch 🇳🇱, let me know if you would like to see English 🇬🇧 translations. 

Autocheck is a Firefox extension that provides useful information about a car given it's license plate. The data is fetched from [open data sets provided by the RDW](https://opendata.rdw.nl/). The information displayed by the extension can help you make informed decisions when looking to buy a secondhand car.
## Highlights
* Automatically fetch license plate if browsing [Marktplaats](https://www.marktplaats.nl/).
* Locally cache requests in session storage to minimize web requests.

## Installation
### Manual installation
1.  ```
    git clone git@github.com:rutgermeuzelaar/autocheck.git
    ```
2.  Enter the debugging URL of Firefox in your browser: `about:debugging#/runtime/this-firefox`.
3.  Click on the 'This Firefox' button.
4.  Click on the 'Load Temporary Add-on...' button.
5.  Navigate to the location where you cloned this repository and select the manifest.json file.
6.  The extension should now be installed! You can pin the extension for extra convenience.

## Usage
1. Click the extension icon in your browser.
2. If you were browsing Marktplaats for cars the license plate should be set already, enter the license plate manually otherwise.
3. Let the information guide you!

## Examples
### GIF
![autocheck](https://github.com/user-attachments/assets/bcb3e183-605f-4ec7-9c6c-1885131c5156)
### Popup screenshot
<img width="236" height="315" alt="autocheck_screenshot" src="https://github.com/user-attachments/assets/7ba8d0e5-a605-4e91-97db-df3c634c2cf8" />
