import * as Az from 'az';
import * as Snowball from 'snowball';
import {stopWords} from './StopWords';
import {NaiveBayesConfig} from './NaiveBayesConfig';

const stemmer = new Snowball('Russian');

export default class NaiveBayes {
    constructor(words, classes) {
        this.config = NaiveBayesConfig;
        // хранит информацию о том, сколько раз определенное слово получило ту или иную классификацию (BoW)
        this.words = words || {};
        // хранит информацию о том, сколько раз та или иная классификация была предписана определенному слову
        this.classes = (classes && Object.getOwnPropertyNames(classes).length > 1) ? classes : this.config.CLASSES;
        this.stemmer = new Snowball(this.config.STEMMER_LANGUAGE);
    }

    get negativeClass() {
        return this.config.NEGATIVE_CLASS_NAME;
    }

    get positiveClass() {
        return this.config.POSITIVE_CLASS_NAME;
    }

    get confidenceThreshold () {
        return this.config.CONFIDENCE_RANGE_THRESHOLD;
    }

    fillBagOfWords(word, cls) {
        if(!word) {
            return;
        }

        this.missingWordGuard(word, cls);
        this.words[word][cls]++;
        this.words[word].amount++;

        this.classes[cls].amount++;
        this.classes.totalAmount++;
        //todo: if this unique counter then update global unique counter
    }

    teach(text, cls) {
        const tokens = this.tokenize(text);
        tokens.forEach(token => this.fillBagOfWords(token, cls));

        return [this.words, this.classes];
    }

    // P(C)
    classProbability(cls) {
        return this.classes[cls].amount / this.classes.totalAmount;
    }

    // условная вер-ть p(W|C)
    wordInClassProbability(word, cls) {
        const smoothing = 1;
        this.missingWordGuard(word, cls);                       // |V|               +                Sum(Wic)
        const prob = (this.words[word][cls] + smoothing) / (this.classes.totalAmount + this.classes[cls].amount);

        return prob;
    }

    missingWordGuard(word, cls) {
        if (!word) {
            return;
        }
        if (!this.words[word]) {
            this.words[word] = Object.assign({}, this.config.NAIVE_BAYES_ENTITY_OBJECT);
            this.words[word][cls] = 0;
        }
        if (!this.words[word][cls]) {
            this.words[word][cls] = 0;
        }

        if (!this.classes[cls]) {
            throw Error(`vkadremove: class ${cls} was not found`);
        }
    }

    //P(C|D)
    tokensInClassProbability(tokens, cls) {
        let prob = 0;
        tokens.forEach(token => {
            const wordProb = this.wordInClassProbability(token, cls);
            prob += Math.log(wordProb);
        });

        prob += Math.log(this.classProbability(cls));
        return prob;
    }

    classify(text, cls = this.negativeClass) {
        let tokens = this.tokenize(text);
        return this.tokensInClassProbability(tokens, cls);
    }

    isNegative(text) {
        const neg = this.classify(text, this.negativeClass);
        const pos = this.classify(text, this.positiveClass);
        // console.log('neg', neg, '| pos,', pos);
        return (neg > pos) && this.isConfidential(neg, pos);
    }

    isConfidential(prob1, prob2) {
        if(isNaN(prob1) || isNaN(prob2) || !isFinite(prob1) || !isFinite(prob2)) {
            return false;
        }
        // console.log('isConfidential range: ' + Math.abs(Math.abs(prob1) - Math.abs(prob2)));
        return Math.abs(Math.abs(prob1) - Math.abs(prob2)) > this.confidenceThreshold;
    }

    tokenize(text) {
        const azTokenize = Az.Tokens(text);
        let tokens = azTokenize.done(['WORD']);
        let linksQuantity = azTokenize.done(['LINK']).length;

        return tokens
            .map(t => t.toString().toLowerCase())
            .filter(token => !(stopWords.indexOf(token) > -1))
            .map(token => {
                if(!this.config.STEMMING_ENABLED) {
                    return token;
                }
                stemmer.setCurrent(token);
                stemmer.stem();

                return stemmer.getCurrent();
            })
            .concat(this.getLinksArray(linksQuantity));
    }

    getLinksArray(size) {
        const mockWord = 'naivebayeslinkmockQiWsWaF';
        return Array(size).fill(mockWord);
    }
}