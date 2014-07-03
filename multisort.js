module.exports = function(toSort, sortings) {
  if (!Array.isArray(sortings)) {
    sortings = [sortings]
  }

  var comparators = sortings.map(makeComparator);

  return toSort.sort(function(a, b) {
    for (var i = 0, len = sortings.length; i < len; i++) {
      var comparatorOutput = comparators[0](a, b);
      if (comparatorOutput !== 0) return comparatorOutput;
    }
    return 0;
  });
};

var makeComparator = function(input) {
  if (isFunction(input)) {
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
  } else if (isString(input)) {
    // Invert the sort if initial character is ! or ~.
    var invertOrder;
    if (input[0] === "!" || input[0] === "~") {
      input = input.slice(1);
      invertOrder = true;
    } else if (input[0] === ".") {
      input = input.slice(1);
    }

    if (/[^\(\r\n]*\([^\(\r\n]*\)$/.test(input)) {
      var indexOfOpenParenthesis = input.indexOf("(");
      var args = JSON.parse("[" + input.slice(indexOfOpenParenthesis+1, -1) + "]");
      input = input.slice(0, indexOfOpenParenthesis);
    }

    return function(a, b) {
      var aValue = nestedProperty(a, input);
      var bValue = nestedProperty(b, input);

      // If key is a function...
      if (args) {
        aValue = aValue.apply(this, args);
        bValue = bValue.apply(this, args);
      }

      if (aValue == bValue || (aValue == null && bValue == null)) {
        return 0
      } else if (aValue > bValue || bValue == null) {
        return invertOrder ? -1 : 1;
      } else {
        return invertOrder ? 1 : -1;
      }
    };
  } else if (isNumber(input)) {
    if (input < 0) {
      return function(a, b) {
        return b - a;
      }
    } else {
      return function(a, b) {
        return a - b;
      }
    }
  }
  throw "Improper input for comparator!"
};

var nestedProperty = function(obj, path) {
  if (path === "") return obj
  var path = path.split(".")
  var current = obj;
  while (path.length) {
    current = current[path.shift()];
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