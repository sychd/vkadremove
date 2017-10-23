import $ from 'jquery';
import {storageService} from './shared/storage/StorageService'
import {contextMenuSelectionObserver} from './content/events/background/ContextMenuSelectionObserver'
import {CONSTANTS} from './shared/Constants'
import {textAnalysisService} from 'text-analysis/TextAnalysisService'

export class PopupPage {
    constructor(storageService, contextMenuSelectionObserver, textAnalysisService) {
        this.contextMenuSelectionObserver = contextMenuSelectionObserver;
        this.storageService = storageService;
        this.textAnalysisService = textAnalysisService;

        this.init();
    }

    init() {
        this.resetted = false;
        this.phrasesEl = $('#phrases');
        this.phrasesListEl = $('ul.phrases-list');
        this.newTextInput = $('#new-phrase');
        this.addTextBtn = $('#add-new-phrase');
        this.resetBtn = $('#reset-all');
        this.registerAddTextEvent();
        this.registerResetAllEvent();

        this.contextMenuSelectionObserver
            .merge(this.storageService.onStorageChanged)
            .subscribe(() => this.refreshPhrasesList());

        this.refreshPhrasesList();
    }

    refreshPhrasesList() {
        this.storageService.getManuallyAddedNegativeTexts()
            .then(texts => {
                this.phrasesListEl.empty();
                if (texts.length) {
                    $.each(texts, (i) =>
                        this.createPhraseLiElement(texts[i], true, true)
                            .appendTo(this.phrasesListEl)
                    )
                } else if(this.resetted) {
                    this.createPhraseLiElement(CONSTANTS.POPUP.ALL_DATA_HAS_BEEN_DELETED, false)
                        .appendTo(this.phrasesListEl);
                } else {
                    this.createPhraseLiElement(CONSTANTS.POPUP.NO_DATA_ENTERED, false).appendTo(this.phrasesListEl);
                }
            });
    }

    createPhraseLiElement(text,cut = false, appendDelBtn = false) {
        const deleteBtn = $('<button/>').addClass('btn btn-del')
            .text('delete').click(() => this.storageService.removeManuallyAddedNegativeText(text));

        const label = cut && text.length > 45 ? `${text.substr(0, 43)}... ` : `${text}  `;
        const li = $('<li/>').addClass('text-item').text(label);
        appendDelBtn && li.append(deleteBtn);
        li.title = text;
        return li;
    }

    registerAddTextEvent() {
        this.addTextBtn.click(() => {
            if (!this.newTextInput.val().length) {
                return;
            }

            this.textAnalysisService.teachNegative(this.newTextInput.val());
            this.newTextInput.val('');
        });
    }

    registerResetAllEvent() {
        this.resetBtn.click(() => {
            if(!confirm('Вы уверены, что хотите стереть все данные?')) {
                return;
            }

            this.resetted = true;
            this.storageService.resetStorage();

            setTimeout(() => {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                    window.close();
                });
            }, 2000);
        });
    }
}

export const popupPage = new PopupPage(storageService, contextMenuSelectionObserver, textAnalysisService);