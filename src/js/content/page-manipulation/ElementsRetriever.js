import {CONSTANTS} from '../../shared/Constants';
import {Post} from "./Post";

export default class ElementRetriever {
    constructor() {
    }

    get mainFeed() {
        return this._arrify(document.querySelector(`#${CONSTANTS.VK.DOM.MAIN_FEED_ID}`));
    }

    get posts() {
        let posts = this._arrify(document.querySelectorAll(`div[id^=${CONSTANTS.VK.DOM.POST_PREFIX_ID}`));

        posts = posts.map(post => {
                const authorEl = post.querySelector(`.${CONSTANTS.VK.DOM.POST.AUTHOR_CLASS}`);
                const contentEl = post.querySelector(`.${CONSTANTS.VK.DOM.POST.CONTENT_CLASS}`);

                return new Post(post, authorEl, contentEl);
            }).filter(post => !this._isComment(post));

        return posts;
    }

    getPostText(post) {
        return this._arrify(post.querySelectorAll(`.${CONSTANTS.VK.DOM.POST_CLASS}`));
    }

    getPostsFrom(targetEl) {
        return this._arrify(targetEl.querySelectorAll(`div[id^=${CONSTANTS.VK.DOM.POST_PREFIX_ID}`));
    }

    getPostById(targetEl) {
        return this._arrify(targetEl.querySelectorAll(`div[id^=${CONSTANTS.VK.DOM.POST_PREFIX_ID}`));
    }

    _arrify(collection) {
        return [].slice.call(collection);
    }

    _isComment(post) {
        return !post.contentHolders.find(el => !!el);
    }
}

export const elementsRetriever = new ElementRetriever();
