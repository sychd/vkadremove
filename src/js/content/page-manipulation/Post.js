export class Post {
    constructor(postRef, ...DOMContentHolders) {
        this.postRef = postRef;
        this.contentHolders = [...DOMContentHolders];
    }
}