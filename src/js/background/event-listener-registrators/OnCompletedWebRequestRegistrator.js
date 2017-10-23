import {CONSTANTS} from "../../shared/Constants";

const defaultListener = (details) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {result: "loaded"}, (response) => {
            console.log(response.farewell);
        });
    });
}

export default function registerUploadNextNewsEvent(listenerFn = defaultListener) {
    chrome.webRequest.onCompleted.addListener(listenerFn, {urls: [CONSTANTS.VK.URL]});
};