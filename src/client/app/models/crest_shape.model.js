(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('CrestShapeModel', CrestShapeModel);

    CrestShapeModel.$inject = [];
    /* @ngInject */
    function CrestShapeModel() {
        var crestShapeModel;

        crestShapeModel = {
            data: [],
            parse: parse,
            clear: clear,
            selectedShape: {},
            selectedPattern: {},

            ////Todo: remove all that staff
            //collection: {
            //    selectedPattern: {},
            //    dataPattern: [],
            //    data: [],
            //    selectedIndex: 1,
            //    selectedIndexPattern: 1,
            //    maxElementsInCollection: 3,
            //    go: {
            //        next: goNext,
            //        previous: goPrevious
            //    },
            //    is: {
            //        next: isNext,
            //        previous: isPrevious
            //    },
            //    init: initCollection,
            //    fill: collectionRegenerate,
            //    fillPattern: collectionPatternRegenerate,
            //    clear: collectionClear
            //}
        };

        return crestShapeModel;

        // model implementation

        function parse(data) {
            crestShapeModel.data = data.data.result;
            //crestShapeModel.collection.init();
        }

        function clear() {
            //crestShapeModel.collection.clear();
            crestShapeModel.data = [];
        }

        //Todo: remove all that staff
        // collection implementation

        function collectionClear() {
            crestShapeModel.collection.dataPattern = [];
            crestShapeModel.collection.data = [];
        }

        function initCollection() {
            crestShapeModel.collection.selectedIndexPattern = 1;
            crestShapeModel.collection.selectedIndex = 1;
            for (var i = 0; i < crestShapeModel.collection.maxElementsInCollection; i++) {
                crestShapeModel.collection.data.push(
                    crestShapeModel.data[i + crestShapeModel.collection.selectedIndex - 1] || {}
                );

                crestShapeModel.collection.dataPattern.push(
                    crestShapeModel.data[crestShapeModel.collection.selectedIndex]['crest_patterns'][i] || {}
                );
            }

            crestShapeModel.collection.selectedPattern = crestShapeModel.data[crestShapeModel.collection.selectedIndex]['crest_patterns'][crestShapeModel.collection.selectedIndexPattern] || {};
        }

        function collectionRegenerate() {
            for (var i = 0; i < crestShapeModel.collection.maxElementsInCollection; i++) {
                crestShapeModel.collection.data[i] = crestShapeModel.data[i + crestShapeModel.collection.selectedIndex - 1] || {};
                crestShapeModel.collection.dataPattern[i] = crestShapeModel.data[crestShapeModel.collection.selectedIndex]['crest_patterns'][i] || {};
            }
            crestShapeModel.collection.selectedIndexPattern = 1;
        }

        function collectionPatternRegenerate() {
            for (var i = 0; i < crestShapeModel.collection.maxElementsInCollection; i++) {
                crestShapeModel.collection.dataPattern[i] = crestShapeModel.data[crestShapeModel.collection.selectedIndex]['crest_patterns'][
                    i + crestShapeModel.collection.selectedIndexPattern - 1
                ] || {};
            }
        }

        function isNext(isPattern) {
            if (isPattern) {
                if (
                    (crestShapeModel.collection.selectedIndexPattern + 1) < crestShapeModel.data[
                        crestShapeModel.collection.selectedIndex
                    ]['crest_patterns'].length
                ) {
                    return true;
                }
            } else {
                if ((crestShapeModel.collection.selectedIndex + 1) < crestShapeModel.data.length) {
                    return true;
                }
            }
            return false;
        }

        function isPrevious(isPattern) {
            if (isPattern) {
                if ((crestShapeModel.collection.selectedIndexPattern - 1) >= 0) {
                    return true;
                }
            } else {
                if ((crestShapeModel.collection.selectedIndex - 1) >= 0) {
                    return true;
                }
            }
            return false;
        }

        function goNext(isPattern) {
            if (crestShapeModel.collection.is.next(isPattern)) {
                if (isPattern) {
                    crestShapeModel.collection.selectedIndexPattern++;
                    crestShapeModel.collection.fillPattern();
                } else {
                    crestShapeModel.collection.selectedIndex++;
                    crestShapeModel.collection.fill();
                }
                crestShapeModel.collection.selectedPattern = crestShapeModel.data[crestShapeModel.collection.selectedIndex]['crest_patterns'][crestShapeModel.collection.selectedIndexPattern] || {};
            }
        }

        function goPrevious(isPattern) {
            if (crestShapeModel.collection.is.previous(isPattern)) {
                if (isPattern) {
                    crestShapeModel.collection.selectedIndexPattern--;
                    crestShapeModel.collection.fillPattern();
                } else {
                    crestShapeModel.collection.selectedIndex--;
                    crestShapeModel.collection.fill();
                }
                crestShapeModel.collection.selectedPattern = crestShapeModel.data[crestShapeModel.collection.selectedIndex]['crest_patterns'][crestShapeModel.collection.selectedIndexPattern] || {};
            }
        }

    }
})();
