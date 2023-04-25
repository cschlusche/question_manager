<template>
  <GridLayout columns="1*, 7*, 2*" class="item" :class="itemClass">
    <Label col="0" class="indicator" ref="indicator" :class="indicatorClass" @tap="onIndicatorTap" />

    <TextField
      col="1"
      :text="item.shortTitle"
      @returnPress="onUpdateItem"
      textWrap="true"
      ref="title"
    />
    <!--<Button col="2" text.decode="&#xf14d;" class="fas" @tap="onShareItemTap" />-->
    <Button col="2" text.decode="&#xf044;" class="fas" @tap="onEditWorkbenchTap" />
  </GridLayout>
</template>

<!-- //TODO A :class="{open: !item.status, closed: item.status}" -->

<script>
import c from "../constants";
import store from "../store/store";
import mt from "../store/mutation-types";
import { Color } from "color";

export default {
  name: "QuestionItem",
  store,
  props: {
    index: {
      type: Number
    },
    id: {
      type: String
    }
  },
  computed: {
    /**
     * binding of item
     * @see https://vuex.vuejs.org/guide/forms.html#two-way-computed-property
     */
    item: {
      get() {
        return store.state.questionList[this.index];
      }
    },

    itemClass: function() {
      return {
        odd: this.index % 2 == 1,
        even: this.index % 2 == 0
      };
    },

    indicatorClass: function() {
      return {
        open: this.item.status == c.questionStatus.open,
        closed: this.item.status == c.questionStatus.closed
      };
    }
  },
  methods: {
    /**
     * TODO integrate in onUpdateItem()
     */
    onIndicatorTap: function(event) {
      /* eventName: "tap"
            object: {Label}
            view: {Label}
            type: 1*/

      this.$emit("indicator-tapped", this.index);
    },

    onUpdateItem: function(event) {
      /* event {eventName: "returnPress", object: TextField{}}*/
      console.log("onUpdateItem");

      /* qChanges {idx; id; shortTitle} */
      let qChanges = { idx: this.index, id: this.id };

      switch (event.eventName) {
        case "returnPress":
          qChanges.shortTitle = event.object.text;
          break;
      }

      store.dispatch(mt.UPDATE_QUESTION, qChanges);
    },

    onShareItemTap: function(event) {
      /* eventName:"tap" */

      this.$emit("share-item-tapped", this.index);
    },

    onEditWorkbenchTap: function() {

      console.log("(1) edit-item-tapped fired.");
      this.$emit('edit-item-tapped', this.id);
    }
  }
};
</script>

<style scoped>
.item TextField {
  border-bottom-color: transparent;
  border-color: transparent;
  background-color: transparent;
  color:#fff;
}

.item TextField:focus {
  border-bottom-color: #42b883;
}

.indicator {
  border-width: 2;
  border-radius: 30;
  width: 30;
  height: 30;
}

.open {
  border-color: #ff3700;
}

.closed {
  border-color: #42b883;
  background-color: #42b883;
}
</style>