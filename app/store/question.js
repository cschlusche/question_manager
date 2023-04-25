// questionobject.js

import c from "../constants";

class Question {
    
    constructor() {
        
        /**
        * Local instance of {Question} will be stored in VueX
        * @see {@link "./app/store/store.js"} 
        * 
        * @typedef {object} Question
        * @property {Number} id
        * @property {Number} status @see '/app/constants.js'
        * @property {string} shortTitle
        * @property {string} shortDescription Description of the question (sent to helper)
        * @property {Array.<Number>} enumCategories List of assorted enumerable properties (lecture)
        * @property {Array.<string>} tags
        * @property {Array} assets Stores relative path to ImageAssets ([{ photo: ""}, {photo: ""}]) (//FIXME: flatten structure (no individual captures, one single capture) )
        */

        this.id = null;
        this.idx = '';
        this.status = c.questionStatus.open;
        this.shortTitle = '';
        this.shortDescription = '';
        this.enumCategories = { lecture: null };
        this.tags = [];
        this.assets = [];
    }
}

export default Question;