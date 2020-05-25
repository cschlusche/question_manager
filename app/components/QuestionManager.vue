<template>
  <!-- //TODO B ListViewGridLayout -->
  <ListView for="item in questionList">
    <v-template>
      <QuestionItem
        :item="item"
        :index="$index"
        @indicator-tapped="handleIndicatorTapped"
        @share-item-tapped="handleShareItemTapped"
      ></QuestionItem>
    </v-template>
  </ListView>
</template>

<script>
//var view = require("ui/core/view"); // required by what?
//import RadListView from 'nativescript-ui-listview/vue';

//import { ViewModel } from "./";
import store from "../store/store";
import c from "../constants";
import QuestionItem from "./QuestionItem";
import mt from "../store/mutation-types";

/* Share Question with images */
//import { SocialShare } from "nativescript-social-share";
const SocialShare = require("nativescript-social-share");

/* Couchbase */

export default {
  name: "QuestionManager",
  store,
  components: {
    QuestionItem
  },
  created() {
    //TODO load data from Couchbase
    console.log("(0) store.dispatch('INIT_QUESTION_MANAGER')");
    store.dispatch(mt.INIT_QUESTION_MANAGER);
  },
  computed: {
    questionList() {
      return store.state.questionList;
    }
  },
  data() {
    return {
      /**
       * model for list of questions
       *
       * @property {number} id                      - identifier
       * @property {number} status {0: open; 1:ongoing; 2:closed}
       * @property {string} shortTitle
       * @property {string} shortDescription
       * @property {string} longDescription
       * @property {object} categoriesList {categoriesLectures}
       * @property tags
       *
       */
      //TODO how to import this object from an separate file?
      //questionStatus: { open: 0, closed: 1 },
    };
  },
  methods: {
    handleIndicatorTapped(qID) {
      console.log("(0) store.dispatch('UPDATE_INDICATOR')");

      store.dispatch(mt.UPDATE_INDICATOR, qID);
    },

    /**
     * @description Provides all photos as {@link ImageSource} of the current question that will be shared
     *
     * @param {integer} questionID
     */
    handleShareItemTapped(qID) {
      //TODO vuex: is direct reading allowed? might be unproblematic unless no writing.

      SocialShare.shareMultipleImages(
        this.questionList[qID].shortDescription,
        this.questionList[qID].assets
      );

      //TODO set question status to "shared" (introduce additional status beside open/closed)
    }
  }
};
</script>

<style scoped lang="scss">
.item {
  width: auto;
  height: 80;
  font-size: 18;
}

.even {
  background-color: #333;
}
.odd {
  background-color: #555;
}
</style>