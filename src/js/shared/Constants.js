export const CONSTANTS = {
    VK: {

        DOM: {
            MUTATION_DEBOUNCE: 100,
            MAIN_FEED_ID: 'main_feed',
            POST_PREFIX_ID: 'post',
            POST_CLASS: 'wall_post_text',
            POST: {
                AUTHOR_CLASS: 'post_author',
                CONTENT_CLASS: 'wall_text'
            },
            ADVERTISE_CLASSES: ['wall_marked_as_ads', 'wall_text_name_explain_promoted_post']
        },
        URL: 'https://vk.com/*',
        DISABLED_URLS_REGEX: [
            /https:\/\/vk.com\/im*/,
            /https:\/\/vk.com\/audios*/
        ]
    },
    STORAGE: {
        WORDS: 'classifier_words',
        CLASSES: 'classifier_classes',
        LEARNED_POSITIVE_TEXTS: 'positive_texts',
        MANUALLY_ADDED_NEGATIVE_TEXTS: 'negative_manually_added_texts'
    },
    POPUP: {
        LEARN_IN_PROCESS: 'Классификатор изучает ваши записи. Пытайтесь избегать страниц, содержащие нежелательные записи до того момента, как это предупреждение исчезнет.',
        NO_DATA_ENTERED: 'Самостоятельно внесенные элементы отсутсвуют.\nВы можете добавить их через форму выше или путём использования контекстного меню (Выделить текст, нажать правую кнопку мыши, добавить в коллекцию).',
        ALL_DATA_HAS_BEEN_DELETED: 'Все данные, были очищены, страница будет перезагружена.'
    },
    CONTEXT_MENU_LABEL: 'Добавить в коллекцию нежелательных записей',
    DEBUG_LOG: true
};

//document.querySelectorAll('div[id^=post]');