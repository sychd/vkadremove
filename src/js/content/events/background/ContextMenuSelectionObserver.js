import Rx from 'rxjs';

function createContextMenuSelectionObserver() {
    const actionSubject = new Rx.Subject();
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
        actionSubject.next({request, sender, sendResponse})
    );

    return actionSubject;
};

export const contextMenuSelectionObserver = createContextMenuSelectionObserver();
