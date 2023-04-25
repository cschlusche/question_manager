[x] Change ActionBar to each Component
[x] [QuestionManager] Toggle item status (for now)
[x] Implement Vuex
[x] [QuestionManager+VueX] Adapt binding to VueX 
[x] [Questionitem] VueX add two-way binding (https://vuex.vuejs.org/guide/forms.html#two-way-computed-property)
[x] [NewQuestion] Finish prototype
[x] Store photo

Zero: Enable Android Emulator (Nativescript Sidekick?)
avdmanager create avd -p '/Users/christian/.android/avd/' -k "system-images;android-29;google_apis_playstore;x86_64" -n "Pixel_C_Custom" -d "pixel_c"
Check of nativescript styling-framework

A-Send intent to WhatsApp
[x] Research: https://github.com/tjvantoll/nativescript-social-share
[x] Take a collection of photos (and captions)
    [x] Captions can not be differnetiated for each photo (@see SocialShare.shareMultipleImages() )
      => question.shortDescription should be the only caption for-each photo
[] @high Create component ViewQuestion (modify NewQuestion)
[] @critical Aufgenommene Fotos werden nicht mehr direkt angezeigt (nachdem Hinzufügen-Dialog erneut aufgerufen wird) @actualCommit
      [] @low Scale photos
[] @high Bei Foto-Serien wird nur das erste Foto mehrfach versendet
[x] Send multiple photos with corresponding annotations to WhatsApp 


B-Make data persistent
[] @critical Implement couchbase
  [x] IDs are overwritten during INIT 
  [x] Integrate Couchbase API with VueX (store.js mutations.[mt.INSERT_QUESTION]) 
  [] UPDATE_QUESTION @today 
  [] Remove tracebacks @today
  [] Create question class and import into NewQuestion (data() and initNewQuestion()) @today

C-Code documentation and deployment
[] @low Document code compliant with JSDoc
[] Document visually in Lucidchart
  [] Document all types of user-defined events
[] @critical Fix open todos (xxx)
  [] Add Error logging + handling functionalities
  
  [] Add assertions to each function
  [x] @critical Use trace-module for tracing (https://www.nativescript.org/blog/tracing-nativescript-applications) @actualCommit
  [] Write logfile
[] Update nativescript components
[] Create readme.md
[] git commit (update .gitignore)
[] Consider upload alpha-version on GitHub

D-Set up server data store
[] Couchbase

E-Additional functionality
[] Expand data-structure to enable multiple photos, categories, tags, etc.
[] Create Feedback concept (link: https://github.com/EddyVerbruggen/nativescript-feedback)
[] Bugsnag: Error reporting from other sources (link: https://market.nativescript.org/plugins/nativescript-bugsnag)
[] Pick an already taken photo (link: https://github.com/NativeScript/nativescript-imagepicker)

F-Code security
[] Use JavaScript strict mode (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
[] NativeScript Blog: Secure Your Mobile App
  - Protecting the code (https://www.nativescript.org/blog/secure-your-mobile-app-protecting-the-code)
  - Securing data at rest (https://www.nativescript.org/blog/secure-your-mobile-app-securing-data-at-rest)
  - Securing data in transit (https://www.nativescript.org/blog/secure-your-mobile-app-securing-data-in-transit)
  - Secure user auth (https://www.nativescript.org/blog/secure-your-mobile-app-secure-user-auth)

G-Tools
[x] Test Nativescript Sidekick


# ANDROID Environment

# DEPRECATED A: $ANDROID_HOME /usr/local/share/android-sdk

# NEW B: Android Studio /Users/christian/Library/Android/sdk 
~/.zshrc
#export ANDROID_HOME=/usr/local/share/android-sdk
export ANDROID_HOME=~/Library/Android/
#export ANDROID_SDK_ROOT=/usr/local/share/android-sdk
export ANDROID_SDK_ROOT=/Users/christian/Library/Android/sdk


## start emulator
$ANDROID_SDK_ROOT/emulator/emulator -netdelay none -netspeed full -avd Pixel_3a_API_29
# alternativ via Android Studio (!?)