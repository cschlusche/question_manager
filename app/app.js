/* Import RadListView: https://docs.nativescript.org/vuejs/ns-ui/ListView/overview */
//import VueDevtools from 'nativescript-vue-devtools';
import Vue from "nativescript-vue";
//import RadListView from 'nativescript-ui-listview/vue';
import Vuex from 'vuex'
import * as trace from '@nativescript/core/trace'
import Home from "./components/Home";

/* @link https://github.com/NativeScript/NativeScript/blob/cc97a1680009f1bf6dbf97c421f6e8dc535295b5/nativescript-core/trace/Readme.md */
trace.setCategories(trace.categories.concat(trace.categories.Error, trace.categories.Debug, trace.categories.Navigation))
trace.enable()
trace.write("I (heart) tracing", trace.categories.Error);
new Vue({
    
    template: `
    <Frame>
    <Home />
    </Frame>`,
    
    components: {
        Home
    }
}).$start();

Vue.config.silent = true

//Vue.use(VueDevtools, {host: '192.168.178.25'})
//Vue.use(RadListView)
Vue.use(Vuex)