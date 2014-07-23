module.exports = function(toSort, sortings) {
  // Allow partial application.
  if (arguments[1] == null) {
    sortings = toSort;
    toSort = null;
  }

  if (!Array.isArray(sortings)) {
    sortings = [sortings]
  }

  // Turn each sorting into a function that evalutes an item.
  var evaluators = sortings.map(makeEvaluator);
  

  // Allow partial application.
  if (toSort == null) {
    return function(toSort) {
      return module.exports(toSort, sortings)
    }
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

var evaluateItems = function(input, evaluators) {
  for (var i = 0, len = input.length; i < len; i++) {
    var item = input[i];
    input[i] = {
      item: item,
      values: evaluators.map(function(evaluator) {return evaluator.func(item)})
    }
  }
}

var revertItems = function(input) {
  for (var i = 0, len = input.length; i < len; i++) {
    input[i] = input[i].item;
  }
}

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

var makeFunctionalEvaluator = function(input) {
  return {
    func: input,
    invert: false
  }
}

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
}

var isFunction = function(input) {
  return toString.call(input) == '[object Function]';
};

var isNumber = function(input) {
  return toString.call(input) == '[object Number]';
};

var isString = function(input) {
  return (typeof input == 'string' || input instanceof String);
};