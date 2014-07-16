module.exports = function(toSort, sortings) {
  // Allow partial application.
  if (arguments[1] == null) {
    sortings = toSort;
    toSort = null;
  }

  if (!Array.isArray(sortings)) {
    sortings = [sortings]
  }

  var comparators = sortings.map(makeComparator);

  // Return partially applied version if no array is passed to sort.
  if (toSort == null) {
    return function(toSort) {
      return toSort.sort(function(a, b) {
        for (var i = 0, len = sortings.length; i < len; i++) {
          var comparatorOutput = comparators[i](a, b);
          if (comparatorOutput !== 0) return comparatorOutput;
        }
        return 0;
      });
    }
  // Otherwise sort now.
  } else {  
    return toSort.sort(function(a, b) {
      for (var i = 0, len = sortings.length; i < len; i++) {
        var comparatorOutput = comparators[i](a, b);
        if (comparatorOutput !== 0) return comparatorOutput;
      }
      return 0;
    });
  }

};

var makeComparator = function(input) {
  if (isFunction(input)) {
    return makeFunctionComparator(input);
  } else if (isString(input)) {
    return makeStringComparator(input);
  } else if (isNumber(input)) {
    return makeNumericalComparator(input);
  }
  throw "Improper input for comparator!"
};

var makeFunctionComparator = function(input) {
  return function(a, b) {
    var aValue = input(a);
    var bValue = input(b);

    if (aValue > bValue) {
      return 1;
    } else if (bValue > aValue) {
      return -1;
    } else {
      return 0;
    }
  };
}

var makeStringComparator = function(input) {
  // Invert the sort if initial character is ! or ~.
  var invertOrder;
  if (input[0] === "!" || input[0] === "~") {
    input = input.slice(1);
    invertOrder = true;
  } else if (input[0] === ".") {
    input = input.slice(1);
  }

  if (input[input.length - 1] === "?") {
    var existential = true;
    input = input.slice(0, -1);
  }

  return function(a, b) {
    var aValue = nestedProperty(a, input);
    var bValue = nestedProperty(b, input);

    // If our string ended with "?"
    if (existential) {
      aValue = (aValue != null)
      bValue = (bValue != null)
    }

    if (aValue == bValue || (aValue == null && bValue == null)) {
      return 0
    } else if (aValue > bValue || bValue == null) {
      return invertOrder ? -1 : 1;
    } else {
      return invertOrder ? 1 : -1;
    }
  };
};

var makeNumericalComparator = function(input) {
  if (input < 0) {
    return function(a, b) {
      return b - a;
    }
  } else {
    return function(a, b) {
      return a - b;
    }
  }
};

var nestedProperty = function(obj, path) {
  if (path === "") return obj
  var path = path.split(".")
  var current = obj;
  while (path.length) {
    var nextKey = path.shift()
    
    if (/[^\(\r\n]*\([^\(\r\n]*\)$/.test(nextKey)) {
      var indexOfOpenParenthesis = nextKey.indexOf("(");
      var args = JSON.parse("[" + nextKey.slice(indexOfOpenParenthesis+1, -1) + "]");
      nextKey = nextKey.slice(0, indexOfOpenParenthesis);
    }

    current = current[nextKey];
    
    // If key is a function...
    if (args) {
      current = current.apply(null, args);
    }

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