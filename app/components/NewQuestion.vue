<template>
  <!-- //TODO add A ActionBar -->
  <ScrollView orientation="vertical">
    <StackLayout class="nt-form">
      <!-- question.shortTitle -->
      <StackLayout class="nt-input">
        <Label text="Titel der Frage" class="font-weight-bold m-b-5" />
        <TextField v-model="newQuestion.shortTitle" textWrap="true" />
      </StackLayout>

      <!-- question.shortDescription -->
      <StackLayout class="nt-input">
        <Label text="Beschreibung für Helper" class="font-weight-bold m-b-5" />
        <TextView
          v-model="newQuestion.shortDescription"
          editable="true"
          id="shortDescription"
          class="m-b-30"
        />
      </StackLayout>

      <!-- question.assets -->
      <Button
        :text="txtLectureChoosen"
        @tap="onLectureTapped"
        class="fas -outline m-b-30"
      />

      <Label text.decode="&#xf302; Erklärungen" class="fas h2 text-center"></Label>
      <WrapLayout id="assets">
        <Image
          v-for="asset in newQuestion.assets"
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
  name: "NewQuestion",
  store,
  components: {
    ModalListPicker
  },
  props: {
    /*item: {
      type: Object
    }*/
  },

  data() {
    return {
      /**
       * Local instance of {Question} will be stored in VueX
       * @see {@link "./app/store/store.js"} 
       * 
       * @typedef {object} Question
       * @property {Number} id
       * @property {Number} status @see '/app/constants.js'
       * @property {string} shortTitle
       * @property {string} shortDescription Description of the question (sent to helper)
       * @property {Array.<Number>} enumCategories List of assorted enumerable properties (lecture)
       * @property {Array.<string>} tags
       * @property {Array} assets Stores relative path to ImageAssets ([{ photo: ""}, {photo: ""}]) (//FIXME: flatten structure (no individual captures, one single capture) )
       */
      newQuestion: {
        id: null,
        status: c.questionStatus.open,
        shortTitle: "P-Wert bei der ANOVA",
        shortDescription:
          "Bei drei gegebenen Verteilungen, wieso sollte der p-Wert kleiner werden, wenn sich ...",
        enumCategories: { lecture: null },
        tags: [],
        assets: []
      },

      cameraPermissionGranted: false,

      lecturePicker: ModalListPicker
    };
  },

  computed: {
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

    txtLectureChoosen: function (){
      
      if(!isNaN(this.newQuestion.enumCategories.lecture) && this.newQuestion.enumCategories.lecture !== null){
        console.log("txtLectureChoosen(): numeric");
        let indexOfSelectedLecture = this.newQuestion.enumCategories.lecture;
        return "VL: " + c.categoriesLecturesItems[indexOfSelectedLecture];
      }else{
        return "Wähle Vorlesung";
      }
    },

    // ListPicker: data for ListPicker.items
    itemsCategoriesLectures: function() {
      return c.categoriesLecturesItems; // local variable included, as c.categoriesLectures could not be use within template
    }
  },

  methods: {
    initNewQuestion: () => {
      return {
        id: null,
        status: c.questionStatus.open,
        shortTitle: "",
        shortDescription: "",
        longDescription: "",
        enumCategories: { lecture: null },
        tags: [],
        photos: []
      };
    },

    onLectureTapped: function () {

      // note-to-myself: then() does not seem to work within event-attributes in xml
      
      this.$showModal(this.lecturePicker, {fullscreen:true, props: 
                                              {heading: "Vorlesung auswählen",
                                              label: "Wähle die Vorlesung aus, die am stärksten mit deiner Frage zusammenhängt:",
                                              items: this.itemsCategoriesLectures,
                                              dataModel: this.newQuestion.enumCategories.lecture}})
                        .then(data => this.newQuestion.enumCategories.lecture=data);
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
              that.newQuestion.assets.push({
                id: that.newQuestion.assets.length,
                photo: imageAsset
              });
              //that.newQuestion.photos.push(that.cameraImage);

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

      this.$store.dispatch(mt.INSERT_QUESTION, this.newQuestion);

      // erase form fields
      this.newQuestion = this.initNewQuestion();
      this.cameraImage = null;
      this.labelText = "";
      this.cameraPermissionGranted = false;

      // navigate to list
      this.$emit("new-question-stored");
      console.log(
        "(1) NewQuestion.onSubmitTapped() emits event: new-question-stored"
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