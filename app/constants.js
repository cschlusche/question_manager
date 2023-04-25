export default {
    /**
    * Enumeration for {Question}.status
    * QuestionManager.vue : Question object
    * @readonly
    * @enum {number}
    */
    questionStatus : {
        open: 0,
        closed: 1
    },
    /** 
     * Categories for {Question}.enumCategories.lecture
     * @readonly
     * @enum {number}
     * */
    categoriesLectures : {
        introduction: 0,
        genereLinearModel: 1,
        introAnova: 2,
        sequelAnova: 3
    },

    /**
     * QuestionWorkbench: Items for ListPicker
     * @readonly
     */
    categoriesLecturesItems : [
        "Einführung",
        "Allgemeines Lineares Modell",
        "Einführung in die ANOVA",
        "Fortsetzung der ANOVA"
    ], 
}