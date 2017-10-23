export const TextAnalysisConfig = {
    TEXT_COLLECTOR_LEARN_START_AT: 25,
    TRIGGER_LEARN_AT_WORD_AMOUNT_DIFFERENCE: 200,
    TEXT_LEARN_MIN_LENGTH: 75,          //ignore 'short texts' + covers most part of headers during learn,
    MANUALLY_ADDED_TEXT_WEIGHT_MULTIPLIER: 4,  // make manually added ingore more weightfull
    MANUALLY_ADDED_TEXT_MULTIPLIER_ENABLED: true,
    MANUALLY_ADDED_TEXT_LENGTH_TRIGGER_MULTIPLY: 50
};