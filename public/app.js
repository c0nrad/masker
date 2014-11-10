'use strict';

var app = angular.module('app', ['rt.debounce']);

app.controller('MainController', function($scope, debounce) {
  $scope.lol = 'abc';

  $scope.radius = 50;
  $scope.invert = false;
  $scope.plate = false;

  $scope.models = [
    { shape: 'cube', size: [5,5,5], translation: [-5,-5,0],resolution: 16, radius: 5 },
    { shape: 'cube', size: [5,5,5], translation: [5,5,0], resolution: 16, radius: 5 },
    { shape: 'cube', size: [5,5,5], translation: [0, 0, 0], resolution: 16, radius: 5 },
    { shape: 'sphere', radius: 3, resolution: 16, translation: [10, 0, 0], size: [5,5,5] }
  ];

  $scope.clear = function() {
    $scope.models = [];
  };

  $scope.addShape = function() {
    $scope.models.push({ shape: 'cube', size: [1,1,1], translation: [0,0,0], resolution: 16, radius: 5 });
  };

  $scope.removeShape = function(i) {
    $scope.models.splice(i, 1);
  };

  $scope.array = {
    shapeType: 'cube',
    startX: -22.5,
    startY: -22.5,
    rows: 10,
    cols: 10,
    delta: 5
  };

  $scope.addArray = function(shapeType, startX, startY, rows, cols, delta) {
    for (var x = 0; x < rows; ++x) {
      for (var y = 0; y < cols; ++y) {
        var X = startX + delta * x;
        var Y = startY + delta * y;
        $scope.models.push({shape: shapeType, translation:[X, Y, 0], resolution: 16, radius: 5});
      }
    }
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
      shapes.unshift('cylinder');
    }

    if (shapes.length === 0)
      return out + '}';

    // Add Unions / difference
    var shapesOut = 'return ' + shapes[0];

    for (i = 1; i < shapes.length; i += 1) {
      if (!invert) {
        shapesOut += '.union(' + shapes[i] + ')';
      } else {
        shapesOut += '.subtract(' + shapes[i] + ')';
      }
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
