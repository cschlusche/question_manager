<template>
  <Page>
    <StackLayout
      width="85%"
      horizontalAlignment="center"
      verticalAlignment="middle"
    >
      <Label class="h2" :text="heading" textWrap="true"></Label>
      <Label class="h3" :text="label" textWrap="true"></Label>
      <ListPicker :items="items" v-model="dataModel" class="m-b-30"></ListPicker>
      <!-- xxx check whether storing the new value succeeds -->
      <!-- xxx raise evnt and show new value -->
      <Button @tap="onTabClose" text="Fertig" class="-outline" />
    </StackLayout>
  </Page>
</template>

<script>
import { ListPicker } from "tns-core-modules/ui/list-picker";

export default {
  name: "ModalListPicker",
  props: {
    //TODO: use required
    //FIXME: default values

    /**
     * @type {string}
     */
    heading: { type: String },

    /**
     * @type {string}
     */
    label: { type: String },

    /**
     * @type {Array}
     */
    items: {
      type: Array
    },

    /**
     * @type {Number}
     */
    dataModel: {
      type: Number
    }
  },
  data() {
    return {};
  },
  methods: {
    onTabClose: function() {
      this.$modal.close(this.dataModel);
    }
  }
};
</script>

<style lang="scss">
</style>