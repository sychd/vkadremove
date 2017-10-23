import {storageService} from  'shared/storage/StorageService';
import NaiveBayes from './naive-bayes/NaiveBayes';
import {NaiveBayesConfig} from './naive-bayes/NaiveBayesConfig';
import {TextAnalysisConfig} from './TextAnalysisConfig';
import Rx from 'rxjs';
import {CONSTANTS} from "../shared/Constants";
class TextAnalysisService {
    constructor(storageService) {
        this.storageService = storageService;
        this.cyclicTextCollector = [];
        this.globalTextCollector = [];
        this.classifierLearnInProcessSubject  = new Rx.Subject();

        this.initClassifier();
        this.storageService.onNegativeTextManuallyAdded.subscribe((text) => this.teachNegative(text));
    }

    initClassifier() {
        this.storageService.onClassifierDataLoad.subscribe(() => {
            const sub = Rx.Observable
                .combineLatest(
                    this.storageService.getWords(),
                    this.storageService.getClasses()
                ).filter(data => !!data[0]).subscribe(data => {
                    const [words, classes] = data;
                    this.words = words;
                    this.classes = classes;
                    this._classifier = new NaiveBayes(this.words, this.classes);
                    this.shouldLearn() ? console.log('vkadremove: classifier is learning...') :
                        console.log('vkadremove: classifier is ready to work!');

                    CONSTANTS.DEBUG_LOG && console.log('words', words, '\nclasses', classes);
                    sub.unsubscribe();
                });
        });
    }

    get classifier() {
        return this._classifier;
    }

    containsAdverts(text) {
        this.classifierLearnInProcessSubject.next(this.shouldLearn());
        if (this.shouldLearn()) {
            this.machineLearnPositive(text);
            return;
        }

        text = this.reduceWhitespaces(text);
        // CONSTANTS.DEBUG_LOG && console.log(this.classifier.classify(text, 'neg'), this.classifier.classify(text, 'pos'));
        const isNegative = this.classifier.isNegative(text);
        if(CONSTANTS.DEBUG_LOG && isNegative) {
            console.log('\n::::::text marked as negative by classifier::::::\n', text.substring(0,150),
                'distance is:', this.classifier.classify(text, 'neg') - this.classifier.classify(text, 'pos'));

        }

        return isNegative;
    }

    reduceWhitespaces(str) {
        return str.replace(/\s\s+/g, ' ');
    }

    shouldLearn() {
        if(!this.classes) {
            throw Error('vkadremove: reset all data, error occurred.');
        }

        return this.classes[NaiveBayesConfig.NEGATIVE_CLASS_NAME].amount === 0 ||
            (this.classes[NaiveBayesConfig.NEGATIVE_CLASS_NAME].amount -
            this.classes[NaiveBayesConfig.POSITIVE_CLASS_NAME].amount) > TextAnalysisConfig.TRIGGER_LEARN_AT_WORD_AMOUNT_DIFFERENCE;
    }

    machineLearnPositive(text) {
        if (!this.isTextSuitableForLearn(text) || !this.isUnique(text)) {
            return;
        }

        this.cyclicTextCollector.push(text);
        if (!this.isCollectorFull(text)) {
            return;
        }

        this.globalTextCollector = this.globalTextCollector.concat(this.cyclicTextCollector);
        this.cyclicTextCollector = [];

        this.storageService.getAutomaticallyAddedPositiveTexts().then((collectedTexts) => {
            if(this.globalTextCollector.length <= TextAnalysisConfig.TEXT_COLLECTOR_LEARN_START_AT + 1) {
                this.globalTextCollector.concat(collectedTexts);
            }

            this.cyclicTextCollector.forEach(text => {
                if (!this.storageService.isUnique(text, collectedTexts)) {
                    return;
                }

                const [words, classes] = this.classifier.teach(text, NaiveBayesConfig.POSITIVE_CLASS_NAME);
                this.words = words;
                this.classes = classes;
                collectedTexts.push(text);
            });

            this.updateData(this.words, this.classes);
            this.storageService.setPositiveTexts(collectedTexts);
            CONSTANTS.DEBUG_LOG && console.log('learn cycle finished', this.classes);
            this.cyclicTextCollector = [];
        });
    }

    teachNegative(text) {
        const sourceText = text;
        if(TextAnalysisConfig.MANUALLY_ADDED_TEXT_MULTIPLIER_ENABLED) {
            for(let i = 0; i < TextAnalysisConfig.MANUALLY_ADDED_TEXT_WEIGHT_MULTIPLIER; i++) {
                text += ` ${text}`;
            }
        }

        this.storageService.getManuallyAddedNegativeTexts().then((texts) => {
            if(!this._isUnique(sourceText, texts)) {
                return;
            }

            const [words, classes] = this.classifier.teach(text, NaiveBayesConfig.NEGATIVE_CLASS_NAME);
            this.updateData(words, classes);
            this.words = words;
            this.classes = classes;
            texts.push(sourceText);
            this.storageService.setNegativeTextsManuallyAdded(texts);
            CONSTANTS.DEBUG_LOG &&  console.log('classes after teachNegative', classes);
        });
    }

    updateData(words, classes) {
        this.storageService.setWords(words);
        this.storageService.setClasses(classes);
    }

    isCollectorFull() {
        return this.cyclicTextCollector.length > TextAnalysisConfig.TEXT_COLLECTOR_LEARN_START_AT;
    }

    isTextSuitableForLearn(text) {
        return text && text.length > TextAnalysisConfig.TEXT_LEARN_MIN_LENGTH
    }

    isUnique(text) {
        return (this._isUnique(text, this.cyclicTextCollector) && this._isUnique(text, this.globalTextCollector));
    }

    _isUnique(value, array) {
        array = array || [];
        return !array.find(elem => elem === value);
    }

    _printPositiveWords() {
        Object.keys(this.words).forEach(key => {
           if(this.words[key].pos) {
               console.log(this.words[key]);
           }
        });
    }

}

export const textAnalysisService = new TextAnalysisService(storageService);