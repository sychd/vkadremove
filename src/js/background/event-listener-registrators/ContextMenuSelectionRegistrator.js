import {CONSTANTS} from "../../shared/Constants";
export default function registerSelectionEvent(onClickHandler) {
    chrome.contextMenus.create({
        title: CONSTANTS.CONTEXT_MENU_LABEL,
        documentUrlPatterns: [CONSTANTS.VK.URL],
        contexts: ['selection'],
        onclick: onClickHandler
    });
}