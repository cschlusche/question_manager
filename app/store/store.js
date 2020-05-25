import { Couchbase } from 'nativescript-couchbase-plugin';
import Vue from 'vue';
import Vuex from 'vuex';
import c from "../constants";
import mt from './mutation-types';

//import { couchBasePlugin } from './db'; // plugin

Vue.use(Vuex)

// @link https://github.com/vuejs/vuex/blob/dev/examples/todomvc/store/index.js

// @link https://www.nativescript.org/blog/data-management-with-sqlite-and-vuex-in-a-nativescript-vue-app

export default new Vuex.Store({

    // add interface to connect with CouchBase 
    plugins: [],

    /* can be read with:  store.state.{attribute} */
    state: {
        questionList: [],
        /*questionList: [{
            id: 0,
            status: c.questionStatus.open,
            shortTitle: "Voraussetzungen für die Regressionsanalyse",
            shortDescription: "",
            longDescription: "",
            enumCategories: { lecture: 0 },
            tags: ["regression", "voraussetzungen"],
            assets: []
        }],*/
        database: null
    },

    /* triggered by store.commit( {binding} ) */
    // executed synchronously
    mutations: {

        [mt.INIT_QUESTION_MANAGER]: (state, arrDocOfQuestions) => {

            /**
             * arrDocOfQuestions : [
             *                      { "questionList": [
             *                                         {"id":[], ...},
             *                                         {"id":[], ...},
             *                                         {"id":[], ...},
             *                                         ]
             *                      }
             *                      ]         
             */

             try{
            console.log("(2) mutation: INIT_QUESTION_MANAGER")
            console.log("arrDocOfQuestions: " + JSON.stringify(arrDocOfQuestions));

            console.log("arrDocOfQuestions[0].questionList: "+ arrDocOfQuestions[0].questionList);
            let qList = arrDocOfQuestions[0].questionList

            //state.database = cb;

            for (let question of qList) {
                console.log("(2) mutation: INIT_QUESTION_MANAGER: pushed question: " + question.shortTitle)
                state.questionList.push(question);
            }
            
        }catch(e){
            console.log('Error: ' + e.message)
        }

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

            state.questionList.push(new_question);
            console.log("(2) mutation: INSERT_QUESTION: store.questionList " + JSON.stringify(state.questionList))

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
            console.log('(1) action: INIT_QUESTION_MANAGER')
            //TODO add assertions

            const cb = new Couchbase('questions');

            try {

                // purge
                //purgeDocsFromDatabase(cb)

                const res = cb.query({
                    select: [],
                    from: 'questions',
                    limit: 1
                });

                console.log("(1) action: INIT_QUESTION_MANAGER res.length: " + res.length);
                console.log("(1) action: INIT_QUESTION_MANAGER res: " + JSON.stringify(res));

                if (res.length >= 1) {
                    commit(mt.INIT_QUESTION_MANAGER, res);
                }

            } catch (e) {
                console.log(e);
            }
        },

        /**
         * 
         * @param {*} param0 
         * @param {object} question 
         */
        [mt.INSERT_QUESTION]({ commit }, new_question) {
            console.log('(1) action: INSERT_QUESTION')
            //TODO add assertions

            const cb = new Couchbase('questions');
            try {


                // set questionID
                new_question.id = getNextQuestionID(this.state.questionList)

                /* res: {Array} [{id, ...}]*/
                const res = cb.query({
                    select: [], // query all
                    from: 'questions', // Omit or set null to use current db
                    //where: [{ property: 'firstName', comparison: 'equalTo', value: 'Osei' }],
                    //order: [{ property: 'firstName', direction: 'desc' }],
                    limit: 10
                });

                //DEBUG: db contents before
                debug_write_couchbase(cb, res, "(1) action: INSERT_QUESTION CouchBase before insert")
                


                // check whether data is available
                if (res.length > 1) {
                    throw "Too many documents in CouchBase"
                } else if (res.length == 1) { //TODO @critical update condition
                    appendQuestion(new_question, cb, res[0].id)
                } else {
                    let docID = initializeDocument(this.state.questionList, new_question, cb)
                }

                //DEBUG: db contents before
                /* res: {Array} [{id, ...}]*/
                const res2 = cb.query({
                    select: [], // query all
                    from: 'questions', // Omit or set null to use current db
                    //where: [{ property: 'firstName', comparison: 'equalTo', value: 'Osei' }],
                    //order: [{ property: 'firstName', direction: 'desc' }],
                    limit: 10
                });

                debug_write_couchbase(cb, res2, "(1) action: INSERT_QUESTION CouchBase after insert")
                //DEBUG END


            } catch (e) {
                /** [MDN Console.log()]{@link https://developer.mozilla.org/en-US/docs/Web/API/Console/log} */
                throw new Error("Error: " + e.message);


            }

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


const debug_write_couchbase = (cb, res, message) => {

    console.log(message)
    if (res.length > 0) {
        console.log(JSON.stringify(cb.getDocument(res[0].id)));
    }else{
        console.log("OK: res is empty");
    }
}

/**
 * Provides ID for new question
 * qID is the incremented ID of the last element in state.questionList
 * 
 * @returns length of state.questionList
 */
const getNextQuestionID = (pRef_ql) => {

    let ref_ql = pRef_ql;
    let ref_ql_length = ref_ql.length;

    if (ref_ql_length > 0) {

        let lastSetID = ref_ql[ref_ql_length - 1].id;


        return ++lastSetID

    } else {


        return 0;
    }
}

/**
 * 
 * @param {*} pObject 
 */
const printObjectToConsole = (pObject) => {

    let s = JSON.stringify(pObject);
    console.log(JSON.stringify(s));
}

const purgeDocsFromDatabase = (cb) => {
    // purge
    const res = cb.query({
        select: [],
        from: 'questions',
        limit: null
    });
    res.forEach(function (doc, index) {

        cb.deleteDocument(doc.id);
    });
}

/**
 * Store complete question-list within a document
 * 
 */
const initializeDocument = (arr_stateQList, obj_question, cb) => {

    try {


        let obj_qList = { questionList: [obj_question] }

        let docID = cb.createDocument(obj_qList);
        const dQuestion = cb.getDocument(docID);
        printObjectToConsole(dQuestion);

        return docID;

    } catch (e) {
        throw "Could not initialize new document"
    }
}


const appendQuestion = (question, cb, docID) => {
    //TODO add assertions
    try {

        let arr_storedDoc = [cb.getDocument(docID)]
        console.assert(arr_storedDoc !== undefined, "Doc could not be retrieved")

        let arr_storedDoc_qList = arr_storedDoc[0].questionList
        console.assert(arr_storedDoc_qList !== undefined, "qList could not be retrieved")

        let arr_combined_qList = arr_storedDoc_qList.concat([question])

        let obj_qList = { questionList: arr_combined_qList }
        cb.updateDocument(docID, obj_qList)


    } catch (e) {
        console.log(e);
        throw new Error("Error: " + e.message)
    }
}

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