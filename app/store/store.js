import Vue from 'vue'
import Vuex from 'vuex'
import c from "../constants";
import mt from './mutation-types';


import { couchBasePlugin } from './db'; // plugin

Vue.use(Vuex)

// @link https://github.com/vuejs/vuex/blob/dev/examples/todomvc/store/index.js

export default new Vuex.Store({

    // add interface to connect with CouchBase 
    plugins: [couchBasePlugin],

    /* can be read with:  store.state.{attribute} */
    state: {
        questionList: [{
            id: 0,
            status: c.questionStatus.open,
            shortTitle: "Voraussetzungen für die Regressionsanalyse",
            shortDescription: "",
            longDescription: "",
            enumCategories: { lecture: 0 },
            tags: ["regression", "voraussetzungen"],
            /**
             * @type {photo: ImageAsset, caption: string} assets
             */
            assets: []
        }]
    },

    /* triggered by store.commit( {binding} ) */
    mutations: {

        [mt.INIT_QUESTION_MANAGER]: (state) => {
            //TODO
            
        },

        /**
         * Pushes a new question object into questionList
         * 
         * @param {*} state
         * @param {object} new_question Complete question object
         */
        [mt.INSERT_QUESTION]: (state, new_question) => {
            console.log('(2) mutation: INSERT_QUESTION')

            /* set new id
                                                            3+
            // xxx todo care for breaks in sequence (0,1, 3, n)    
                                                    0, 1, 3, 3 <-- key collison 
               (a) use data structure that provides sequential id
               (b) update all entries' ids after changing a list entry */
            new_question.id = state.questionList.length;
            state.questionList.push(new_question);

            // couchbase
            //couchBasePlugin.getDocument(this.db.query({ select: [], where [{ property: 'xx', comparison: 'xx', value: 'xx' }]}))

            // hook should be called dynamically

        },
        [mt.UPDATE_INDICATOR]: (state, qID) => {

            console.log('(2) mutation: UPDATE_INDICATOR')

            let qStatus = state.questionList[qID].status;
            let res;

            switch (qStatus) {
                case c.questionStatus.open:
                    res = c.questionStatus.closed;
                    break;

                case c.questionStatus.closed:
                    res = c.questionStatus.open;
            }

            state.questionList[qID].status = res;
        },
        /** 
         * @param {object} question             - whole questionObject, changes are determined in the following
         */
        [mt.UPDATE_QUESTION]: (state, question_changes) => {

            console.log('(2) mutation: UPDATE_QUESTION')

            let qID = question_changes.id;
            let qStoredQuestion = state.questionList[qID];

            // iterate over changes object
            for (let [key, value] of Object.entries(question_changes)) {

                //console.log("(" + key + ", " + value + ")");
                //console.log("(" + key + ", " + question[key] + ")");

                if (value != qStoredQuestion[key]) {

                    let temp_old_value = qStoredQuestion[key];
                    qStoredQuestion[key] = value;
                    console.log("mutation.UPDATE_QUESTION: updated questionList[" + qID + "]." + key + ": (" + temp_old_value + " -> " + value + ")");
                }
            }

        },
        /*dropQuestion: (state, questionID) => {
            state.questionList.splice(questionID); //remove questionID @link https://www.w3schools.com/jsref/jsref_splice.asp
        }*/
    },

    /*
       ^
       | action:commit() -> mutation
       |
       actions can be asynchronous, instead of mutations that are synchronous
    */
    actions: {

        /**
         * 
         * @param {*} param0 
         * @param {*} new_question 
         */
        [mt.INIT_QUESTION_MANAGER]({ commit }) {
            console.log('(1) action: INIT_QUESTION_MAANGER')
            //TODO add assertions
            commit(mt.INIT_QUESTION_MANAGER);
        },

        /**
         * 
         * @param {*} param0 
         * @param {object} question 
         */
        [mt.INSERT_QUESTION]({ commit }, new_question) {
            console.log('(1) action: INSERT_QUESTION')
            //TODO add assertions
            commit(mt.INSERT_QUESTION, new_question)
        },

        [mt.UPDATE_INDICATOR]({ commit }, qID) {
            console.log('(1) action: UPDATE_INDICATOR')
            //TODO add assertions
            commit(mt.UPDATE_INDICATOR, qID)
        },

        /**
         * 
         * @param {*} param0 
         * @param {object} question_changes 
         */
        [mt.UPDATE_QUESTION]({ commit }, question_changes) {
            console.log('(1) action: UPDATE_QUESTION')
            //TODO add assertions
            commit(mt.UPDATE_QUESTION, question_changes)
        }
    }
});



/*

questionList: [
        {
          id: 0,
          status: c.questionStatus.open,
          shortTitle: "Voraussetzungen für die Regressionsanalyse",
          shortDescription: "",
          longDescription: "",
          enumCategories: { lecture: 0 },
          tags: ["regression", "voraussetzungen"]
        },
        {
          id: 1,
          status: c.questionStatus.closed,
          shortTitle: "Voraussetzungen für die Varianzanalyse",
          shortDescription: "",
          longDescription: "",
          enumCategories: { lecture: 0 },
          tags: ["anova", "voraussetzungen"]
        },
        {
          id: 2,
          status: c.questionStatus.open,
          shortTitle: "Voraussetzungen für die Faktorenanalyse",
          shortDescription: "",
          longDescription: "",
          enumCategories: {lecture: 0 },
          tags: ["faktorenanalyse", "voraussetzungen"]
        },
        {
          id: 3,
          status: c.questionStatus.open,
          shortTitle: "Voraussetzungen für Strukturgleichungsmodelle",
          shortDescription: "",
          longDescription: "",
          enumCategories: { lecture: 0 },
          tags: ["strukturgleichungsmodelle", "voraussetzungen"]
        }
      ]

*/