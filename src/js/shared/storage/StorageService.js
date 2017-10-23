import {CONSTANTS} from "../Constants";
import {Subject} from "rxjs/Subject";
import {defaultNegativeBagOfWords} from "./initial-classifier-data/DefaultNegativeBagOfWords";
import {defaultClasses} from "./initial-classifier-data/DefaultClasses";

import Rx from 'rxjs';

export class StorageService {
    constructor() {
        this.storage = chrome.storage.local;
        this.onClassifierDataLoad = new Subject();
        this.onStorageChanged = new Subject();
        this.onNegativeTextManuallyAdded = new Subject();

        this.firstTimeInitStorage();
    }

    firstTimeInitStorage() {
        this.getWords().subscribe((words) => {
            if (!words) {
                this.storage.set(this.initStoragePayload(), () => this.onClassifierDataLoad.next());
            } else {
                this.onClassifierDataLoad.next();
            }
        })
    }

    getWords() {
        const promise = new Promise((resolve) => {
            this.storage.get(CONSTANTS.STORAGE.WORDS, (res) => {
                resolve(res[CONSTANTS.STORAGE.WORDS]);
            });
        });

        return Rx.Observable.fromPromise(promise);
    }

    getClasses() {
        const promise = new Promise((resolve) => {
            this.storage.get(CONSTANTS.STORAGE.CLASSES, (res) => {
                resolve(res[CONSTANTS.STORAGE.CLASSES]);
            });
        });

        return Rx.Observable.fromPromise(promise);
    }

    setWords(words) {
        const payload = {};
        payload[CONSTANTS.STORAGE.WORDS] = words;
        this.storage.set(payload);
    }

    setClasses(classes) {
        const payload = {};
        payload[CONSTANTS.STORAGE.CLASSES] = classes;
        this.storage.set(payload);
    }

    setPositiveTexts(texts) {
        const payload = {};
        payload[CONSTANTS.STORAGE.LEARNED_POSITIVE_TEXTS] = texts;
        this.storage.set(payload);
        this.onStorageChanged.next();
    }

    getAutomaticallyAddedPositiveTexts() {
        return new Promise((resolve) => {
            this.storage.get(CONSTANTS.STORAGE.LEARNED_POSITIVE_TEXTS, (res) => {
                resolve(res[CONSTANTS.STORAGE.LEARNED_POSITIVE_TEXTS] || []);
            });
        });
    }

    getManuallyAddedNegativeTexts() {
        return new Promise((resolve) => {
            this.storage.get(CONSTANTS.STORAGE.MANUALLY_ADDED_NEGATIVE_TEXTS, (res) => {
                // console.log(res);
                resolve(res[CONSTANTS.STORAGE.MANUALLY_ADDED_NEGATIVE_TEXTS] || []);
            });
        });
    }

    setNegativeTextsManuallyAdded(texts) {

        const payload = {};
        payload[CONSTANTS.STORAGE.MANUALLY_ADDED_NEGATIVE_TEXTS] = texts;
        this.storage.set(payload);
        CONSTANTS.DEBUG_LOG && console.log('setNegativeTextsManuallyAdded');
        this.onStorageChanged.next();
    }

    addNegativeText(text) {
        return this.getManuallyAddedNegativeTexts()
            .then(texts => {
                if (this.isUnique(text, texts)) {
                    texts.push(text);
                }

                return texts;
            })
            .then(texts => {
                this.setNegativeTextsManuallyAdded(texts);
                this.onNegativeTextManuallyAdded.next(text);
            });
    }

    removeManuallyAddedNegativeText(text) {
        this.getManuallyAddedNegativeTexts()
            .then(texts => {
                const index = texts.indexOf(text);
                texts.splice(index, 1);
                return texts;
            })
            .then(texts => this.setNegativeTextsManuallyAdded(texts));
    }

    resetStorage() {
        this.setClasses(null);
        this.setWords(null);
        this.setNegativeTextsManuallyAdded(null);
        this.setPositiveTexts(null);
    }

    isUnique(value, array) {
        return !array.find(elem => elem === value);
    }

    initStoragePayload() {
        const payload = {};
        payload[CONSTANTS.STORAGE.CLASSES] = defaultClasses;
        payload[CONSTANTS.STORAGE.WORDS] = defaultNegativeBagOfWords;
        payload[CONSTANTS.STORAGE.MANUALLY_ADDED_NEGATIVE_TEXTS] = [];
        payload[CONSTANTS.STORAGE.LEARNED_POSITIVE_TEXTS] = [];

        return payload;
    }
}

export const storageService = new StorageService();