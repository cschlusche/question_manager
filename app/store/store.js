import { Couchbase } from 'nativescript-couchbase-plugin';
import Vue from 'vue';
import Vuex from 'vuex';
import c from "../constants";
import mt from './mutation-types';
import * as trace from '@nativescript/core/trace'
//import CustomConsoleWriter from '../tracewriter';
/* {@link https://www.nativescript.org/blog/tracing-nativescript-applications} */
var CustomConsoleWriter = (function () {
    function CustomConsoleWriter() { }
    CustomConsoleWriter.prototype.write = function (message, category, type) {
        if (!console) return;

        var msgType = type === undefined ? trace.messageType.log : type;
        var traceMessage = category + ": " + message;

        switch (msgType) {
            case trace.messageType.log:
                console.log(traceMessage);
                break;
            case trace.messageType.info:
                console.info(traceMessage);
                break;
            case trace.messageType.warn:
                console.warn(traceMessage);
                break;
            case trace.messageType.error:
                console.error(traceMessage);
                break;
            default:
                console.log(traceMessage);
        }
    };
    return CustomConsoleWriter;
})();

//import { couchBasePlugin } from './db'; // plugin


trace.clearWriters();

Vue.use(Vuex)

// @link https://github.com/vuejs/vuex/blob/dev/examples/todomvc/store/index.js
// @link https://www.nativescript.org/blog/data-management-with-sqlite-and-vuex-in-a-nativescript-vue-app

export default new Vuex.Store({

    // add interface to connect with CouchBase 
    plugins: [],

    /* can be read with:  store.state.{attribute} */
    state: {
        questionList: [],
        dbConnection: null,
        docID: null,
        workbench: { mode: 0, qID: null }
    },

    /* triggered by store.commit( {binding} ) */
    // executed synchronously
    mutations: {

        [mt.INIT_QUESTION_MANAGER]: (state, arrDocOfQuestions) => {

            /**
             * arrDocOfQuestions : [
             *                      { "questionList": [
             *                                         {"id":[xxx-xxx-xxx], idx: 0,...},
             *                                         {"id":[xxx-xxx-xxx], idx: 1,...},
             *                                         {"id":[xxx-xxx-xxx], idx: 2,...},
             *                                         ]
             *                      }
             *                      ]         
             */

            trace.addWriter(new CustomConsoleWriter());
            trace.write("store.js: " + CustomConsoleWriter);


            try {
                trace.write("(2) mutation: INIT_QUESTION_MANAGER", trace.categories.Debug, trace.messageType.log)
                trace.write("arrDocOfQuestions: " + JSON.stringify(arrDocOfQuestions), trace.categories.Debug, trace.messageType.log);

                trace.write("arrDocOfQuestions[0].questionList: " + arrDocOfQuestions[0].questionList, trace.categories.Debug, trace.messageType.log);
                let qList = arrDocOfQuestions[0].questionList

                //TODO @high write validation test for incoming data

                //TODO sort for idx
                // @link https://stackoverflow.com/a/979289/11941004
                // @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
                qList.sort((a, b) => parseInt(a.idx) - parseInt(b.idx));

                for (let question of qList) {
                    trace.write("(2) mutation: INIT_QUESTION_MANAGER: pushed question: " + question.shortTitle, trace.categories.Debug, trace.messageType.log)
                    state.questionList.push(question);
                }

            } catch (error) {
                trace.write(error, trace.categories.Error, trace.messageType.error);
                throw new Error("Error: " + error.message)
            }

        },

        [mt.INIT_DB]: (state, connection) => {
            trace.write('(2) mutation: INIT_DB', trace.categories.Debug, trace.messageType.log)

            state.dbConnection = connection;

            trace.write('(2) mutation: INIT_DB post: ' + JSON.stringify(state.dbConnection), trace.categories.Debug, trace.messageType.log)
        },

        [mt.INIT_DOCID]: (state, id) => {
            trace.write('(2) mutation: INIT_DOCID', trace.categories.Debug, trace.messageType.log)

            state.docID = id;

            trace.write('(2) mutation: INIT_DOCID post: ' + JSON.stringify(state.docID), trace.categories.Debug, trace.messageType.log)
        },

        /**
         * Pushes a new question object into questionList
         * 
         * @param {*} state
         * @param {object} new_question Complete question object
         */
        [mt.INSERT_QUESTION]: (state, new_question) => {
            trace.write('(2) mutation: INSERT_QUESTION', trace.categories.Debug, trace.messageType.log)


            /* set new id
                                                            3+
            // xxx todo care for breaks in sequence (0,1, 3, n)    
                                                    0, 1, 3, 3 <-- key collison 
               (a) use data structure that provides sequential id
               (b) update all entries' ids after changing a list entry */

            state.questionList.push(new_question)
            trace.write("(2) mutation: INSERT_QUESTION: store.questionList " + JSON.stringify(state.questionList), trace.categories.Debug, trace.messageType.log)

            // couchbase
            //couchBasePlugin.getDocument(this.db.query({ select: [], where [{ property: 'xx', comparison: 'xx', value: 'xx' }]}))

            // hook should be called dynamically

        },
        [mt.UPDATE_INDICATOR]: (state, qID) => {

            trace.write('(2) mutation: UPDATE_INDICATOR', trace.categories.Debug, trace.messageType.log)

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
         * @param {Question} qModified {idx: number, estimatedChanges: object}
         */
        [mt.UPDATE_QUESTION]: (state, question) => {

            //TODO check whether commit can truly not accept two parameters
            let targetIdx = question.idx
            //let estimatedChanges = change.estimatedChanges

            trace.write('(2) mutation: UPDATE_QUESTION', trace.categories.Debug, trace.messageType.log)
            trace.write('(2) mutation: UPDATE_QUESTION pre ' + JSON.stringify(state.questionList[targetIdx]), trace.categories.Debug, trace.messageType.log)
            
            //write changes into state object
            /*for (let prop in estimatedChanges) {

                state.questionList[targetIdx][prop] = estimatedChanges[prop];
            }*/
            state.questionList[targetIdx] = question;

            trace.write('(2) mutation: UPDATE_QUESTION post' + JSON.stringify(state.questionList[targetIdx]), trace.categories.Debug, trace.messageType.log)


        },
        /*dropQuestion: (state, questionID) => {
            state.questionList.splice(questionID); //remove questionID @link https://www.w3schools.com/jsref/jsref_splice.asp
        }*/
        [mt.SETUP_WORKBENCH]: (state, workbench) => {

            trace.write('(2) mutation: SETUP_WORKBENCH', trace.categories.Debug, trace.messageType.log)
            state.workbench.mode = workbench.mode;
            state.workbench.qID = workbench.qID;
            trace.write('(2) mutation: SETUP_WORKBENCH post ' + JSON.stringify(state.workbench), trace.categories.Debug, trace.messageType.log)
        },

        [mt.CLEANUP_WORKBENCH]: (state) => {

            trace.write('(2) mutation: CLEANUP_WORKBENCH', trace.categories.Debug, trace.messageType.log)
            state.workbench.mode = 0;
            state.workbench.qID = null;
            trace.write('(2) mutation: CLEANUP_WORKBENCH post ' + JSON.stringify(state.workbench), trace.categories.Debug, trace.messageType.log)
        }
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
            trace.write('(1) action: INIT_QUESTION_MANAGER', trace.categories.Debug, trace.messageType.log)
            //TODO add assertions

            const cb = new Couchbase('questions');
            commit(mt.INIT_DB, cb)

            try {

                // purge
                //purgeDocsFromDatabase(cb)

                const res = cb.query({
                    select: [],
                    from: 'questions',
                    limit: 1
                });

                trace.write("(1) action: INIT_QUESTION_MANAGER res.length: " + res.length, trace.categories.Debug, trace.messageType.log);
                trace.write("(1) action: INIT_QUESTION_MANAGER res: " + JSON.stringify(res), trace.categories.Debug, trace.messageType.log);

                if (res.length >= 1) {
                    commit(mt.INIT_QUESTION_MANAGER, res);
                    commit(mt.INIT_DOCID, res[0].id)
                }

            } catch (error) {
                trace.write(error, trace.categories.Error, trace.messageType.error);
                throw new Error("Error: " + error.message)
            }
        },

        /**
         * 
         * @param {*} param0 
         * @param {object} question 
         */
        [mt.INSERT_QUESTION]({ commit }, new_question) {
            trace.write('(1) action: INSERT_QUESTION', trace.categories.Debug, trace.messageType.log)
            //TODO add assertions

            const cb = this.state.dbConnection;
            try {


                // set questionID
                new_question.id = createQuestionID();
                let idx = getNextInSequence(this.state.questionList)
                console.assert(!isNaN(idx), "a.INSERT_QUESTION: idx is not numeric");
                new_question.idx = idx;
                new_question.pos = idx;

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

                    let docID = res[0].id
                    commit(mt.INIT_DOCID, docID)
                    writeQuestion("append", new_question, cb, res[0].id)

                } else {

                    let docID = initializeDocument(this.state.questionList, new_question, cb)
                    commit(mt.INIT_DOCID, docID)

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


            } catch (error) {
                trace.write(error, trace.categories.Error, trace.messageType.error);
                throw new Error("Error: " + error.message)
            }

            commit(mt.INSERT_QUESTION, new_question)
        },

        [mt.UPDATE_INDICATOR]({ commit }, qID) {
            trace.write('(1) action: UPDATE_INDICATOR', trace.categories.Debug, trace.messageType.log)
            //TODO add assertions
            commit(mt.UPDATE_INDICATOR, qID)
        },

        /**
         * 
         * @param {*} param0 
         * @param {number} idx
         * @param {Question} qModified
         */
        [mt.UPDATE_QUESTION]({ commit }, qModified) {
            trace.write('(1) action: UPDATE_QUESTION', trace.categories.Debug, trace.messageType.log)
            //TODO add assertions

            /**
             *  estimate changes stored vs. changes
             * */

            // question changes {targetIdx: number, estimatedChanges: object}
            //const qIdx = question_changes.idx;

            /**  
             * search state for question with matching id
             * */
            //TODO refactor into function - getQuestionIdxByID()
            //TODO is this obsolete?! Index provided, now matched with ID -> wrong!
            /*let targetIdx = null  // ref in qlEntries (might differ from question.id)
            let qlEntries = this.state.questionList.entries()
            for (let [k, v] of qlEntries) {

                if (v.id === qIdx) {

                    targetIdx = k;
                    break;
                }
            };
            let targetQuestion = this.state.questionList[targetIdx]*/
            let targetQuestion = this.state.questionList.find((question) => question.id === qModified.id)
            console.assert(targetQuestion !== undefined, "targetQuestion is undefined")



            /**
             * collect estimatedChanges to (i) update database und (ii) update store (in mutations)
             */
            // iterate over changes object
            /*let estimatedChanges = {}; // {key : value}

            for (let [key, value] of Object.entries(qModified)) {

                //trace.write("(" + key + ", " + value + ")");
                //trace.write("(" + key + ", " + question[key] + ")");

                if (qModified[key] != targetQuestion[key]) {

                    let temp_old_value = targetQuestion[key];
                    estimatedChanges[key] = value;
                    trace.write("mutation.UPDATE_QUESTION: updated questionList[" + qModified.idx + "]." + key + ": (" + temp_old_value + " -> " + value + ")", trace.categories.Debug, trace.messageType.log);
                }
            }
            console.assert(Object.entries(estimatedChanges).length > 0, "No changes have been stored.")
            */

            // (i) update database update document in couchdb
            writeQuestion("update", qModified, this.state.dbConnection, this.state.docID)
            
            /*const cb = this.state.dbConnection
            cb.updateDocument(this.state.docID,
                JSON.stringify(estimatedChanges) //updateDocument( this.state.questionList )
            );*/

            // (ii) update store (in mutations)
            commit(mt.UPDATE_QUESTION, qModified)
        },

        /**
         * Home.vue calls to change question on Workbench
         * 
         * @param {*} param0 
         * @param {*} qID 
         */
        [mt.SETUP_WORKBENCH]({ commit }, workbench) {
            
            return new Promise((resolve) => {

                trace.write("(1) action: SETUP_WORKBENCH", trace.categories.Debug, trace.messageType.log)
                commit(mt.SETUP_WORKBENCH, workbench)
                resolve()
            })

        },

        [mt.CLEANUP_WORKBENCH]({ commit }){
            trace.write("(1) action: CLEANUP_WORKBENCH", trace.categories.Debug, trace.messageType.log)

            commit(mt.CLEANUP_WORKBENCH);
        }
    },

    getters: {
        getQuestionByID: (state) => (qID) => {

            trace.write("(1) getter: getQuestionById", trace.categories.Debug, trace.messageType.log)
            trace.write("qID: " + JSON.stringify(qID), trace.categories.Debug, trace.messageType.log);
            let q = state.questionList.find(question => question.id === qID);
            trace.write("getters: question " + JSON.stringify(q), trace.categories.Debug, trace.messageType.log);

            console.assert(q !== undefined, "getters: getQuestionByID: Question " + qID + " could not be found!")
            return q;
        }
    }
});


const debug_write_couchbase = (cb, res, message) => {

    trace.write(message, trace.categories.Debug, trace.messageType.log)
    if (res.length > 0) {
        trace.write(JSON.stringify(cb.getDocument(res[0].id)), trace.categories.Debug, trace.messageType.log);
    } else {
        trace.write("OK: res is empty", trace.categories.Debug, trace.messageType.log);
    }
}

const createQuestionID = () => {
    let len = 9;
    let chunks = 3;
    let separator = '-';

    let characters = [];

    for (let i = 1; i <= len; i++) {

        //ascii lowercase 97 - 122

        let char = 97 + Math.floor(Math.random() * 25);
        characters.push(String.fromCharCode(char));

        if ((i > 0) &&
            (i % (len / chunks)) == 0 &&
            i < len) {

            characters.push(separator);
        }
    }

    //console.log(characters);

    var id = characters.join('')
    console.log('id: ' + id);

    return id;
}

/**
 * Provides position for new question
 * index of state.questionList
 * 
 * @returns length of state.questionList
 */
const getNextInSequence = (pRef_questionList) => {

    return pRef_questionList.length;
}

/**
 * 
 * @param {*} pObject 
 */
const printObjectToConsole = (pObject) => {

    let s = JSON.stringify(pObject);
    trace.write(JSON.stringify(s));
}

const purgeDocsFromDatabase = (cb) => {

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

    } catch (error) {
        trace.write(error, trace.categories.Error, trace.messageType.error);
        throw new Error("Error: " + error.message)
    }
}


const writeQuestion = (mode, question, cb, docID) => {
    //TODO add assertions
    try {

        var arr_storedDoc = [cb.getDocument(docID)]
        console.assert(arr_storedDoc !== undefined, "Doc could not be retrieved")

        var arr_storedDoc_qList = arr_storedDoc[0].questionList
        console.assert(arr_storedDoc_qList !== undefined, "qList could not be retrieved")

        if (mode == "append") {
            
            // (a) append
            var arr_combined_qList = arr_storedDoc_qList.concat([question])
            var obj_qList = { questionList: arr_combined_qList }

        } else if (mode == "update") {
            
            // (b) update
            var arr_updated_qList = arr_storedDoc_qList;
            arr_updated_qList[question.idx] = question;
            var obj_qList = { questionList: arr_updated_qList }

        }

        cb.updateDocument(docID, obj_qList)


    } catch (error) {
        trace.write(error, trace.categories.Error, trace.messageType.error);
        throw new Error("Error: " + error.message)
    }
}