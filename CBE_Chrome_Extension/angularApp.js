var app = angular.module("CBEcalc", ["xeditable"]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  //editableOptions.buttons = no;
});

app.factory('classList', [function(){
  var o = {
    classList: []
  };
  return o;
}]);

app.factory('classPrefixes', [function(){
  var c = {
    classPrefixes: []
  };
  return c;
}]);

app.controller('MainCtrl', [
  '$scope',
  'classList',
  'classPrefixes',
  function($scope, classList, classPrefixes){
    $scope.classList = classList.classList;
    $scope.previousGPA = [];
    $scope.classPrefixes = classPrefixes.classPrefixes;
    $scope.gpa = (0.0).toFixed(2);
    $scope.totalCredits = 0;

    $scope.addClass = function(){
      if(!$scope.name || $scope.name === ''){
        return;
      }
      if(!$scope.grade || $scope.grade === ''){
        return;
      }
      if(!$scope.credits || $scope.credits === '' || $scope.credits != parseInt($scope.credits, 10)){
        return;
      }

      var gpa = 0;
      var tempGrade = $scope.grade;
      var letter = tempGrade.substring(0,1);
      var mod = '';
      if(tempGrade.length >= 2){
        mod = tempGrade.substring(1,2);
        if(!(mod === '+' || mod ==='-')){
          mod = '';
        }
      }
      if(letter === "a" || letter === 'A'){
        gpa = 4;
      }else if(letter === "b" || letter === 'B'){
        gpa = 3;
      }else if(letter === "c" || letter === 'C'){
        gpa = 2;
      }else if(letter === "d" || letter === 'D'){
        gpa = 1;
      }else if(letter === "f" || letter === 'F'){
        gpa = 0;
      }else{
        return;
      }

      if(mod === '+' && gpa < 4){
        gpa += 0.3;
      }else if(mod === '-'){
        gpa -= 0.3;
      }

      $scope.classList.push({
        name: $scope.name.substring(0,15),
        grade: letter.toUpperCase() + mod,
        gpa: gpa.toFixed(2),
        credits: $scope.credits
      });

      $scope.name = '';
      $scope.grade = '';
      $scope.credits = '';

      $scope.setGpa();

      return;
    };

    $scope.updatePrevious = function() {
      console.log("made it into function");
      console.log($scope.prevGPA);
      console.log($scope.prevCredits);
      if(!$scope.prevGPA || $scope.prevGPA === ''){
        return;
      }
      if(parseInt($scope.prevGPA) > 4){
        return;
      }
      if(!$scope.prevCredits || $scope.prevCredits === ''){
        return;
      }
      if($scope.prevCredits != parseInt($scope.prevCredits, 10)){
        return;
      }
      if($scope.previousGPA.length > 0){
        $scope.previousGPA.splice(0, $scope.previousGPA.length);
      }

      $scope.previousGPA.push({
        gpa: parseFloat($scope.prevGPA).toFixed(2),
        prevCredits: parseInt($scope.prevCredits)
      });

      $scope.prevGPA = '';
      $scope.prevCredits = '';

      $scope.setGpa();

      return;
    };

    $scope.setGpa = function() {
      var gpa = 0.00;
      var credits = 0.00;

      if($scope.previousGPA.length > 0){
        gpa = $scope.previousGPA[0].gpa * $scope.previousGPA[0].prevCredits;
        credits = $scope.previousGPA[0].prevCredits;
      }

      for(var i = 0 ; i < $scope.classList.length ; i++){
        gpa += (+$scope.classList[i].gpa * +$scope.classList[i].credits);
        credits += +$scope.classList[i].credits;
      }
      if(gpa != 0){
        gpa = gpa / credits;
      }
      $scope.totalCredits = credits;
      $scope.gpa = gpa.toFixed(2);
    };

    $scope.removeClass = function(item) {
      var index = $scope.classList.indexOf(item);
      $scope.classList.splice(index, 1);
      $scope.setGpa();
    };

    $scope.reCalc = function(index){
      var grades = [
        'A',
        'A-',
        'B',
        'B+',
        'B-',
        'C',
        'C+',
        'C-',
        'D',
        'D+',
        'D-',
        'F',
      ];
      var gpas = [
        4,
        3.7,
        3,
        3.3,
        2.7,
        2,
        2.3,
        1.7,
        1,
        1.3,
        0.7,
        0
      ];
      if(grades.indexOf($scope.classList[index].grade.toUpperCase()) < 0){
        $scope.classList[index].gpa = 0;
        $scope.classList[index].credits = 0;
        $scope.classList[index].grade = "invalid";
      }else{
        $scope.classList[index].gpa = gpas[grades.indexOf($scope.classList[index].grade)].toFixed(2);
      }
      $scope.setGpa();
    }

    /* Function to scrape text off page and parse out class information */
    $scope.addPrevClasses = function(info){
      var localData = String(info.data);
      var lines = localData.split('\n');
      var headers = [
        'ECON',
        'ACCT',
        'DSCI',
        'MIS',
        'FIN',
        'MRKT',
        'OPS',
        'MGMT',
        'IBUS',
        'HRM',
      ];
      var grades = [
        'A',
        'A+',
        'A-',
        'B',
        'B+',
        'B-',
        'C',
        'C+',
        'C-',
        'D',
        'D+',
        'D-',
        'F',
        'F+',
        'F-'
      ];
      for(var i = 0 ; i < lines.length ; i++){
        //split on space or group of spaces and store in lineArray
        var lineArray = lines[i].trim().split(/\s+/);

        if(headers.indexOf(lineArray[0]) >= 0){
          var tempName = (lineArray[0] + ' ' + lineArray[1]).substring(0, 8)
          var tempGrade;
          var tempCredits;
          /*
          for(var j = 0 ; j < grades.length ; j++){
            if((lineArray.indexOf(grades[j]) >= 0) || (lineArray.indexOf('K' + grades[j]) >= 0)){
              tempGrade = lineArray[j];
              break;
            }
          }*/

          for(var ind = 5; ind < lineArray.length; ind++){
            if(grades.indexOf(lineArray[ind])>=0){
              tempGrade = lineArray[ind];
              //credits are located one before the grade.
              tempCredits = lineArray[ind-1];
              break;
            }
          }

          $scope.classList.push({
            name: tempName,
            grade: tempGrade,
            gpa: getGPAValue(tempGrade).toFixed(1),
            credits: tempCredits
          });
        }
      }
      $scope.setGpa();
      return;
    };
  }
]);
//function to calculate GPA point based on letter grades
function getGPAValue(string){
  var gpa;
  var letter = string.substring(0,1);
  if(string.length >= 2){
        var mod = string.substring(1,2);
        if(!(mod === '+' || mod ==='-')){
          var mod = '';
        }
      }
      if(letter === "a" || letter === 'A'){
        gpa = 4;
      }else if(letter === "b" || letter === 'B'){
        gpa = 3;
      }else if(letter === "c" || letter === 'C'){
        gpa = 2;
      }else if(letter === "d" || letter === 'D'){
        gpa = 1;
      }else if(letter === "f" || letter === 'F'){
        gpa = 0;
      }else{
        return;
      }

      if(mod === '+' && gpa < 4){
        gpa += 0.3;
      }else if(mod === '-'){
        gpa -= 0.3;
      }
  return gpa;
}


// Update the relevant fields with the new data
function setDOMInfo(info) {
  var scope = angular.element(document.getElementById("main")).scope();
  scope.$apply(function(){
    scope.classList.length = 0;
    scope.addPrevClasses(info);

  });
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called
        //    from the receiving end (content script)
        setDOMInfo);
  });
});
