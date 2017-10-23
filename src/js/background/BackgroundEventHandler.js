import onContextSelection from './event-listener-registrators/ContextMenuSelectionRegistrator'
class BackgroundEventHandler {
    constructor(onContextSelection) {
        this.registerOnContextSelection(onContextSelection);
    }

    registerOnContextSelection(onContextSelection) {
        onContextSelection((info, tab) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) =>
                chrome.tabs.sendMessage(tabs[0].id, {info, tab})
            );
        })
    }
}

export const eventHandler = new BackgroundEventHandler(onContextSelection);