/* Import RadListView: https://docs.nativescript.org/vuejs/ns-ui/ListView/overview */
//import VueDevtools from 'nativescript-vue-devtools';
import Vue from "nativescript-vue";
//import RadListView from 'nativescript-ui-listview/vue';
import Vuex from 'vuex'

import Home from "./components/Home";

new Vue({

    template: `
        <Frame>
            <Home />
        </Frame>`,

    components: {
        Home
    }
}).$start();

//Vue.use(VueDevtools, {host: '192.168.178.25'})
//Vue.use(RadListView)
Vue.use(Vuex)