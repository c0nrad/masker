'use strict';

var app = angular.module('app', []);

app.controller('MainController', function($scope) {
  $scope.lol = 'abc';

  $scope.models = [
    { shape: 'cube', size: [5,5,5], translation: [-5,-5,-5] },
    { shape: 'cube', size: [5,5,5], translation: [5,5,5] },
    { shape: 'cube', size: [5,5,5], translation: [0, 0, 0] },
    { shape: 'sphere', radius: 3, resolution: 16, translation: [10, 0, 0] }
  ];
});

app.filter('modelsToCode', function() {
  return function(models) {
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
