import mt from './mutation-types';
import { Couchbase, ConcurrencyMode } from 'nativescript-couchbase-plugin';

// Vuex Plugin to connect with (local) CouchBase Lite
// @link https://vuex.vuejs.org/guide/plugins.html

export const couchBasePlugin = store => {

    const cb = new Couchbase('questions');

    // called when the store is initialized
    store.subscribe((mutation, state) => {
        // called after every mutation.
        // The mutation comes in the format of `{ type, payload }`.
        //xxx change later to update
        if(mutation.type == mt.INSERT_QUESTION){
            
            try{
                //TODO check payload and update more specific
                /*
                let new_question = payload;
                JSON.stringify( new_question );
                
                for(let [key, value] of Object.entries(payload)){
                    if(['__ob__', '__proto__'].indexOf(key) > -1) continue; //skip __ob__, __proto__
                    
                }
                
                */
               
                let docID = cb.createDocument( state );
                const qList = cb.getDocument(docID);
                console.log(JSON.parse(JSON.stringify(qList)));
                //FIXME output twice

            }catch(e){
                //@link https://developer.mozilla.org/en-US/docs/Web/API/Console/log
                console.log(JSON.parse(JSON.stringify(e)))
            }

        }
    });
};
export default couchBasePlugin;
