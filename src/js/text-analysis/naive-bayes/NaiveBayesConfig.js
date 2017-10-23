export const NaiveBayesConfig = {
    STEMMING_ENABLED: true,
    STEMMER_LANGUAGE: 'Russian',
    NAIVE_BAYES_ENTITY_OBJECT: {amount: 0},
    CONFIDENCE_RANGE_THRESHOLD: 19,//todo: make configurable via UI // чем больше значение, темь меньше режет
    CLASSES: {
        pos: {amount: 0},
        neg: {amount: 0},
        totalAmount: 0
    },
    NEGATIVE_CLASS_NAME: 'neg',
    POSITIVE_CLASS_NAME: 'pos',
}
;