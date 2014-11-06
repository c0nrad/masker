'use strict';

var app = angular.module('app', ['rt.debounce']);

app.controller('MainController', function($scope, debounce) {
  $scope.lol = 'abc';

  $scope.radius = 50;
  $scope.invert = false;
  $scope.plate = false;

  $scope.models = [
    { shape: 'cube', size: [5,5,5], translation: [-5,-5,-5],resolution: 16, radius: 5 },
    { shape: 'cube', size: [5,5,5], translation: [5,5,5], resolution: 16, radius: 5 },
    { shape: 'cube', size: [5,5,5], translation: [0, 0, 0], resolution: 16, radius: 5 },
    { shape: 'sphere', radius: 3, resolution: 16, translation: [10, 0, 0], size: [5,5,5] }
  ];

  $scope.addShape = function() {
    $scope.models.push({ shape: 'cube', size: [1,1,1], translation: [0,0,0], resolution: 16, radius: 5 });
  };

  $scope.update = debounce(2000, function() {
    gProcessor.setJsCad(document.getElementById('code').value);
  });

  $scope.$watch('models', function(newVal) {
    $scope.update();
  }, true);

  $scope.$watchGroup(['radius', 'invert', 'plate'], function() {
    $scope.update();
  });
});

app.filter('modelsToCode', function() {
  return function(models, plate, radius, invert) {
    if (!models) {
      return '';
    }

    var out = 'function main() {\n';
    var shapes = [];

    for (var i = 0; i < models.length; ++i) {
      var model = models[i];
      if (model.shape === 'cube') {
        out += 'var cube' + i + ' = CSG.cube({size: [' + model.size + ']}).translate([' + model.translation + ']);\n';
        shapes.push('cube' + i);
      } else if (model.shape === 'sphere') {
        out += 'var sphere' + i + ' = CSG.sphere({radius: ' + model.radius + ', resolution: ' + model.resolution + '}).translate(['+model.translation+'])\n';
        shapes.push('sphere' + i);
      }
    }

    //Base
    if (plate) {
      out += 'var cylinder = CSG.cylinder({start: [0, 0, -1], end: [0, 0, 0], radius: ' + radius + ', slices: 16});';
      shapes.push('cylinder');
    }

    // Add Unions / difference
    var shapesOut = 'return ' + shapes[0];

    for (i = 1; i < shapes.length; i += 1) {
      shapesOut += '.union(' + shapes[i] + ')';
    }
    shapesOut += ';\n';

    console.log(out, shapes);
    return out + shapesOut + '}';
  };
});
//
// function main() {
//   var cube = CSG.cube({size: [1,2,3]}).translate([-5,-5,-5]);
//   var sphere = CSG.sphere({radius: 10, resolution: 16}).translate([5, 5, 5]);
//   return cube.union(sphere);
// }
//
