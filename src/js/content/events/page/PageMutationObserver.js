import Rx from 'rx-dom';
import {CONSTANTS} from "../../../shared/Constants";

const MutationObserverConfig = {
    childList: true,
    subtree: true
};

export const pageMutationObserver = Rx.DOM.fromMutationObserver(document, MutationObserverConfig)
    .debounce(CONSTANTS.VK.DOM.MUTATION_DEBOUNCE)
    .map(() => CONSTANTS.VK.DISABLED_URLS_REGEX.filter(regex => window.location.href.match(regex)))
    .filter(disabledUrls => !disabledUrls.length);