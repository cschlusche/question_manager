<template>
  <!-- //TODO add A ActionBar -->
  <ScrollView orientation="vertical">
    <StackLayout class="nt-form">
      <Label :text="workbench.mode" />
      <Label :text="workbench.qID" />
      <!-- question.shortTitle -->
      <StackLayout class="nt-input">
        <Label text="Titel der Frage" class="font-weight-bold m-b-5" />
        <TextField v-model="question.shortTitle" textWrap="true" />
      </StackLayout>

      <!-- question.shortDescription -->
      <StackLayout class="nt-input">
        <Label text="Beschreibung für Helper" class="font-weight-bold m-b-5" />
        <TextView
          v-model="question.shortDescription"
          editable="true"
          id="shortDescription"
          class="m-b-30"
        />
      </StackLayout>

      <!-- question.assets -->
      <Button :text="txtLectureChoosen" @tap="onLectureTapped" class="fas -outline m-b-30" />

      <Label text.decode="&#xf302; Erklärungen" class="fas h2 text-center"></Label>
      <WrapLayout id="assets">
        <Image
          v-for="asset in question.assets"
          :key="asset.id"
          :src="asset.photo"
          width="50%"
          class="asset_photo img-rounded"
        />
      </WrapLayout>

      <Button text="Foto hinzufügen" @tap="onTakePictureTap" class="-outline" id="takePicture" />
      <Label :text="txtPermissionGranted" />

      <Button
        text="Frage speichern"
        @tap="onSubmitTapped"
        id="submit"
        class="-primary -rounded-sm"
      />
    </StackLayout>
  </ScrollView>
</template>

<script>
import c from "../constants";
import store from "../store/store";
import mt from "../store/mutation-types";
import ModalListPicker from "./ModalListPicker";
import Question from "../store/question";

import { borderBottomColorProperty } from "tns-core-modules/ui/frame/frame";
import {
  EventData,
  Observable,
  fromObject
} from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { takePicture, requestPermissions } from "nativescript-camera";

export default {
  name: "QuestionWorkbench",
  store,
  components: {
    ModalListPicker
  },

  data() {
    return {
      //question: null,

      cameraPermissionGranted: false,

      lecturePicker: ModalListPicker
    };
  },

  created: function() {
    console.log("QuestionWorkbench.vue: created");
    this.initializeWorkbench();
  },

  /*TODO is not triggered when tab is opened
  try: listen for changes in state.workbench : computed.workbench
*/
  /*beforeUpdate: function(){
      console.log("QuestionWorkbench.vue: beforeUpdate")
      this.initializeWorkbench();
  }*/

  computed: {
    workbench: function() {
      console.log("QuestionWorkbench.vue: computed.workbench executed");
      console.log("workbench: " + JSON.stringify(this.$store.state.workbench));
      return this.$store.state.workbench;
    },

    question: {
      get: function() {
        let question;
        let wb = this.$store.state.workbench;

        if (wb.mode == 0) {
          // initialize empty
          question = new Question();
        } else if (wb.mode == 1) {
          // load existing
          question = this.$store.getters.getQuestionByID(wb.qID);
        }

        return question;
      }
    },

    //TODO Camera: indicator whether required rights are granted
    txtPermissionGranted: function() {
      //TODO need setter for "cameraPermissionGranted"
      let result;

      requestPermissions().then(
        success => {
          result = true;
        },
        error => {
          result = false;
        }
      );

      return result == true ? "(+) Kamera" : "(-) Kamera";
    },

    txtLectureChoosen: function() {
      if (this.question.enumCategories === null) return "Wähle Vorlesung";

      if (
        !isNaN(this.question.enumCategories.lecture) &&
        this.question.enumCategories.lecture !== null
      ) {
        console.log("txtLectureChoosen(): numeric");
        let indexOfSelectedLecture = this.question.enumCategories.lecture;
        return "VL: " + c.categoriesLecturesItems[indexOfSelectedLecture];
      } else {
        return "Wähle Vorlesung";
      }
    },

    // ListPicker: data for ListPicker.items
    itemsCategoriesLectures: function() {
      return c.categoriesLecturesItems; // local variable included, as c.categoriesLectures could not be use within template
    }
  },

  methods: {
    /**
     * called by created() and beforeUpdate()
     */
    initializeWorkbench: function() {

      console.log("### DEPRECATED ### initializeWorkbench()");
      console.log('### DEPRECATED -> computed.question  ### ')
      let wb = this.$store.state.workbench;

      if (wb.mode == 0) {
        // initialize empty
        this.question = new Question();
        console.log(
          "initializeWorkbench: this.question " + JSON.stringify(this.question)
        );
      } else if (wb.mode == 1) {
        // load existing
        this.question = this.$store.getters.getQuestionByID(wb.qID);
      }
    },

    cleanupWorkbench: function() {
      console.log("cleanupWorkbench()");
      let wb = this.$store.state.workbench;
      this.$store.dispatch(mt.CLEANUP_WORKBENCH);

      this.question = new Question();
    },

    onLectureTapped: function() {
      // note-to-myself: then() does not seem to work within event-attributes in xml

      this.$showModal(this.lecturePicker, {
        fullscreen: true,
        props: {
          heading: "Vorlesung auswählen",
          label:
            "Wähle die Vorlesung aus, die am stärksten mit deiner Frage zusammenhängt:",
          items: this.itemsCategoriesLectures,
          dataModel: this.question.enumCategories.lecture
        }
      }).then(data => (this.question.enumCategories.lecture = data));
    },

    onTakePictureTap: function(args) {
      let page = args.object.page;
      let that = this;
      /* start nativescript-camera */
      this.takeAPhoto(that);
    },
    /**
     * @link https://github.com/NativeScript/nativescript-camera
     */
    takeAPhoto: function(that) {
      let options = {
        saveToGallery: false,
        allowEdition: false,
        saveToGallery: false,
        allowsEditing: false,
        keepAspectRatio: true,
        width: 320,
        height: 240
      };
      //cameraImage=null
      /* end nativescript-camera */

      requestPermissions().then(
        () => {
          options.cameraPermissionGranted = true;
          takePicture({
            width: options.width,
            height: options.height,
            keepAspectRatio: options.keepAspectRatio,
            saveToGallery: options.saveToGallery,
            allowsEditing: options.allowsEditing
          }).then(
            imageAsset => {
              //TODO how to store the image byte-array?
              //TODO todo add possibility to store multiple photos
              that.question.assets.push({
                id: that.question.assets.length,
                photo: imageAsset
              });
              //that.question.photos.push(that.cameraImage);

              //TODO todo make scaling work
              imageAsset.getImageAsync(function(nativeImage) {
                let scale = 1;
                let actualWidth = 0;
                let actualHeight = 0;
                if (imageAsset.android) {
                  // get the current density of the screen (dpi) and divide it by the default one to get the scale
                  scale =
                    nativeImage.getDensity() /
                    android.util.DisplayMetrics.DENSITY_DEFAULT;
                  actualWidth = nativeImage.getWidth();
                  actualHeight = nativeImage.getHeight();
                } else {
                  scale = nativeImage.scale;
                  actualWidth = nativeImage.size.width * scale;
                  actualHeight = nativeImage.size.height * scale;
                }
                let labelText =
                  `Displayed Size: ${actualWidth}x${actualHeight} with scale ${scale}\n` +
                  `Image Size: ${Math.round(actualWidth / scale)}x${Math.round(
                    actualHeight / scale
                  )}`;
                console.log(`${labelText}`);
              });
            },
            err => {
              console.log("Error -> " + err.message);
            }
          );
        },
        () => alert("permissions rejected")
      );
    },

    onSubmitTapped: function(event) {
      // append new question to list
      console.log("(1) onSubmitTapped");

      let wb = this.$store.state.workbench;
      if (wb.mode == 0) {
        // insert new question
        this.$store.dispatch(mt.INSERT_QUESTION, this.question);
      } else if (wb.mode == 1) {
        // update existing question
        this.$store.dispatch(mt.UPDATE_QUESTION, this.question);
      }

      // erase form fields
      this.cleanupWorkbench();

      //this.question = this.emptyQuestionWorkbench(); - question is contingent on workbench.mode
      this.cameraImage = null;
      this.labelText = "";
      this.cameraPermissionGranted = false;

      this.$emit("new-question-stored"); // navigate to list

      console.log(
        "(1) QuestionWorkbench.onSubmitTapped() emits event: new-question-stored"
      );
    }
  }
};
</script>

<style scoped lang="scss">
@import "~@nativescript/theme/scss/variables/blue";

TextView#shortDescription {
  height: 120;
  /*margin-bottom: 20;*/
}
ListPicker#lecture {
  height: 120;
  /*background: #555;*/
  /*margin-bottom: 30;*/
}

#assets {
  /*background-color: #555;*/
  //FIXEME make correct use of SASS variables
  @include colorize($background-color: background-dark) /*margin: 30 15 30 15;*/;
}
image.asset_photo {
  /*margin: 10;*/
}
TextView.asset_caption {
  /* margin:10;*/
  height: 40;
}

button#takePicture,
button#submit {
  margin-bottom: 20;
}
</style>