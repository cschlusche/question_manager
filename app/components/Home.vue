<template>
  <Page>
    <ActionBar>
      <Label :text="computeTitle"></Label>
    </ActionBar>

    <BottomNavigation
      @selectedIndexChange="onTabChange"
      :selectedIndex="selectedTab"
      class="bottom-nav"
    >
      <TabStrip>
        <TabStripItem class="tabstripitem">
          <!--<Label text="Question Manager"></Label>-->
          <Label text.decode="&#xf0ae;" class="fas nav-icon"></Label>
        </TabStripItem>
        <TabStripItem class="tabstripitem">
          <!--<Label text="New Question"></Label>-->
          <Label text.decode="&#xf055;" class="fas nav-icon"></Label>
          <!--<Image src="font://&#xf055;" class="fas t-36"></Image>-->
        </TabStripItem>
        <TabStripItem class="tabstripitem">
          <!--<Label text="See Profile"></Label>-->
          <Label text.decode="&#xf2bd;" class="fas nav-icon"></Label>
          <!--<Image src="font://&#xf007;" class="fas t-36"></Image>-->
        </TabStripItem>
      </TabStrip>

      <!-- The number of TabContentItem components should corespond to the number of TabStripItem components -->
      <TabContentItem>
        <QuestionManager @edit-item-tapped="moveToQuestionWorkbench" />
      </TabContentItem>
      <!-- -->
      <TabContentItem>
        <QuestionWorkbench @new-question-stored="moveToQuestionManager" />
      </TabContentItem>
      <!-- -->
      <TabContentItem>
        <Profile />
      </TabContentItem>
    </BottomNavigation>
  </Page>
</template>

<script>
import store from "../store/store";
import QuestionManager from "./QuestionManager";
import QuestionWorkbench from "./QuestionWorkbench";
import Profile from "./Profile";

export default {
  name: "Home",
  store,
  components: {
    QuestionManager,
    QuestionWorkbench,
    Profile
  },
  data() {
    return {
      selectedTab: 0,
      enumTxtTitle: [
        "Manage your questions",
        "Create new question",
        "Edit profile"
      ],
    };
  },
  computed: {
    computeTitle() {
      return this.enumTxtTitle[this.selectedTab];
    },
    computedTabStripHighlight() {}
  },
  methods: {
    /* Debug output for each tab change.
               eventName: "selectedIndexChange"
            */
    // note-to-myself: in template call only method-name; in script use signature with parameters (not included in template)
    onTabChange(event) {
      console.assert(!isNaN(event.value), [event.oldValue, event.value]);

      console.log("TabItem: (" + event.oldValue + " -> " + event.value + ")");
      this.selectedTab = event.value; //not-to-myself: binding with :selectedIndex did not work (even not in play.nativescript.org)
    },

    /**
     * reaction to new-question-stored event
     */
    moveToQuestionManager() {
      console.log(
        "(2) Home.moveToQuestionManager() handles event: new-question-stored"
      );
      this.selectedTab = 0;
    },

    moveToQuestionWorkbench(qID) {
        console.log("Home.vue moveToQuestionWorkbench");
        this.selectedTab = 1;
        // begin transaction
        
        let workbench = {mode: 1, qID: qID}
        this.$store.dispatch("SETUP_WORKBENCH", workbench).then(() => {
          //this.QuestionWorkbench.initializeWorkbench()
        })
        
        //this.workbench_qID = qID;
        //this.workbench_mode = 1;
        // end transaction
    }
  }
};
</script>

<style scoped lang="scss">
@import "~@nativescript/theme/scss/variables/blue";

// Custom styles

.info {
  font-size: 20;
  vertical-align: center;
}

.nav-icon {
  font-size: 24;
}

.tabstripitem:active {
  @include colorize($color: accent);
}
</style>
