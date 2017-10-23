import {contextMenuSelectionObserver} from './background/ContextMenuSelectionObserver'
import {pageMutationObserver} from './page/PageMutationObserver'
import {pageManipulator} from 'content/page-manipulation/PageManipulator'
import {storageService} from 'shared/storage/StorageService'
import {popupPage} from '../../PopupPage'
import {CONSTANTS} from "../../shared/Constants";
import {textAnalysisService} from "../../text-analysis/TextAnalysisService";

export default class EventHandler {
    constructor(options) {
        this.popupPage = options.popupPage;
        this.storageService = options.storageService;
        this.pageManipulator = options.pageManipulator;
        this.textAnalysisService = options.textAnalysisService;
        this.registerOnMutation(options.pageMutationObserver);
        this.registerOnContextSelection(options.contextMenuSelectionObserver);
        this.registerOnStorageChanges(this.storageService.onStorageChanged);
    }

    registerOnMutation(mutationObserver) {
        mutationObserver.subscribe((data) => {
                this.pageManipulator.removeUnwantedPosts();
            },
            err => console.error(`[Mutation error]: ${err}`));
    }

    registerOnContextSelection(contextSelectionObserver) {
        contextSelectionObserver
            .map(data => data && data.request)
            .map(request => request && request.info)
            .map(info => info && info.selectionText)
            .subscribe(selectedText => {
                this.textAnalysisService.teachNegative(selectedText);
                CONSTANTS.DEBUG_LOG && console.log(`'${selectedText}' added to the collection.`);//todo: add notifier
            });
    }

    registerOnStorageChanges(onStorageChanges) {
        onStorageChanges.subscribe(() => {
            this.pageManipulator.removeUnwantedPosts();
        });
    }
}

export const eventHandler = new EventHandler({
    popupPage,
    pageManipulator,
    pageMutationObserver,
    contextMenuSelectionObserver,
    storageService,
    textAnalysisService
});