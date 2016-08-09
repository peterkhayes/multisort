(function (root, factory) {
  // From: https://github.com/umdjs/umd/blob/d31bb6ee7098715e019f52bdfe27b3e4bfd2b97e/templates/returnExports.js
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.multisort = factory();
  }
}(this, function () {

  function mapArray(items, cb) {
    if (!Array.isArray(items)) {
      throw new Error('Not supported');
    }
    var mappedItems = [];
    for (var i = 0; i < items.length; i++) {
      var mapped = cb(items[i]);
      mappedItems.push(mapped);
    }
    return mappedItems;
  }

  // For each item in the input array, transform it into an object with two keys.
  // 'item' stores the item, and 'values' is an array with the results of each
  // evaluator applied to the item.
  var evaluateItems = function(input, evaluators) {
    for (var i = 0, len = input.length; i < len; i++) {
      var item = input[i];
      input[i] = {
        item: item,
        values: mapArray(evaluators, function(evaluator) {return evaluator.func(item)})
      }
    }
  }

  // The opposite of the above function.
  // Reverts the input array back to its original format.
  var revertItems = function(input) {
    for (var i = 0, len = input.length; i < len; i++) {
      input[i] = input[i].item;
    }
  }

  // Users can pass three types of criteria - functions, strings, and numbers.
  var makeEvaluator = function(input) {
    if (isFunction(input)) {
      return makeFunctionalEvaluator(input);
    } else if (isString(input)) {
      return makeStringEvaluator(input);
    } else if (isNumber(input)) {
      return makeNumericalEvaluator(input);
    }
    throw "Improper input for comparator!"
  };

  // Functional evaluators don't need any transformation, and can't have inverted order.
  var makeFunctionalEvaluator = function(input) {
    return {
      func: input,
      invert: false
    }
  }

  // Numerical evaluators sort the input directly if the criterion is non-negative,
  // and in inverted order if the criterion is negative.
  var makeNumericalEvaluator = function(input) {
    return {
      func: function(item) {return item},
      invert: (input < 0)
    }
  };

  var makeStringEvaluator = function(input) {
    // Invert the sort if initial character is ! or ~.
    var invert;
    if (input[0] === "!" || input[0] === "~") {
      input = input.slice(1);
      invert = true;
    }

    // Allow an initial dot: ".prop.subprop" as well as "prop.subprop"
    if (input[0] === ".") {
      input = input.slice(1);
    }

    if (input[input.length - 1] === "?") {
      input = input.slice(0, -1);
      return {
        func: function(item) {return nestedProperty(item, input) != null},
        invert: invert
      }
    } else {
      return {
        func: function(item) {return nestedProperty(item, input)},
        invert: invert
      }
    }
  };

  var nestedProperty = function(obj, path) {
    if (path === "") return obj
    path = path.split(".")
    var current = obj;
    while (path.length) {
      var nextKey = path.shift()

      if (/[^\(\r\n]*\([^\(\r\n]*\)$/.test(nextKey)) {
        var indexOfOpenParenthesis = nextKey.indexOf("(");
        var args = JSON.parse("[" + nextKey.slice(indexOfOpenParenthesis+1, -1) + "]");
        nextKey = nextKey.slice(0, indexOfOpenParenthesis);
      }

      // If key is a function...
      if (args) {
        current = current[nextKey].apply(current, args);
      } else {
        current = current[nextKey];
      }

      // Stop going through the path if we reach a null or undefined
      if (current == null) return null;
    }
    return current;
  };


  var isFunction = function(input) {
    return typeof input === "function";
  };

  var isNumber = function(input) {
    return typeof input === "number";
  };

  var isString = function(input) {
    return typeof input === 'string';
  };

  return function(toSort, sortings) {
    // Allow partial application.
    if (arguments[1] == null) {
      var partialApplication = true;
      sortings = toSort;
    }

    if (!Array.isArray(sortings)) {
      sortings = [sortings]
    }

    // Turn each sorting into a function that evalutes an item.
    var evaluators = mapArray(sortings, makeEvaluator);

    if (partialApplication) {
      var sortFunction = function(toSort) {
        return module.exports(toSort, sortings)
      };
      // To allow this to plug in to other sorting mechanisms.
      sortFunction.comparator = function(a, b) {
        for (var i = 0; i < evaluators.length; i++) {
          var evaluator = evaluators[i];
          var invert = evaluator.invert;
          var aValue = evaluator.func(a);
          var bValue = evaluator.func(b);

          if (aValue > bValue) {
            return invert ? -1 : 1;
          } else if (bValue > aValue) {
            return invert ? 1 : -1;
          }
        }
        return 0;
      }
      return sortFunction;
    }

    // For each item, decorate it with the results of each evaluator.
    evaluateItems(toSort, evaluators);

    // Sort by the decorated results.
    toSort.sort(function(a, b) {
      var aValues = a.values;
      var bValues = b.values;
      for (var i = 0, len = evaluators.length; i < len; i++) {
        var invert = evaluators[i].invert;
        var aValue = aValues[i];
        var bValue = bValues[i];

        if (aValue > bValue) {
          return invert ? -1 : 1;
        } else if (bValue > aValue) {
          return invert ? 1 : -1;
        }
      }
      return 0;
    });

    // Undecorate each item to return cleanly.
    revertItems(toSort);
    return toSort

  };

}));
