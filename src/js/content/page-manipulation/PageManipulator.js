import {elementsRetriever} from './ElementsRetriever';
import {textAnalysisService} from 'text-analysis/TextAnalysisService';
import $ from 'jquery';
import {CONSTANTS} from "shared/Constants";

export class PageManipulator {
    constructor(elementsRetriever, textAnalysisService) {
        this.elementsRetriever = elementsRetriever;
        this.textAnalysisService = textAnalysisService;
        this.removeUnwantedPosts();
    }

    removeUnwantedPosts() {
        // while(!this.textAnalysisService.classifier){}
        if(!this.textAnalysisService.classifier) {
            return;
        }

        this.elementsRetriever.posts
            .filter(post => {
                if (this.ContainsAdMark(post.postRef)) {
                    this.hidePost(post.postRef);
                    //this.addToNegativeBoW
                    return false;
                }

                return true;
            })
            .forEach(post => post.contentHolders
                    .filter(holder => this.textAnalysisService.containsAdverts($(holder).text()))
                    .map(holder => this.removePost(post.postRef)));
    }

    ContainsAdMark(postRef) {
        return !!CONSTANTS.VK.DOM.ADVERTISE_CLASSES.find(cls =>{
            return $(postRef).find(`.${cls}`).length !== 0;
        });
    }

    hidePost(post) {
        $(post).hide();
    }

    removePost(post) {
        $(post).remove();
    }
}

export const pageManipulator = new PageManipulator(elementsRetriever, textAnalysisService);