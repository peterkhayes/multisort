Multitest
=========

A small library for sorting arrays by multiple criteria.

## Installation

  npm install multisort --save

## Basic Usage

  ```javascript
  var input = [
    {firstName: "Kate", "lastName": "Bush"},
    {firstName: "George", lastName: "Bush", "Suffix": "Junior"},
    {firstName: "George", lastName: "Orwell"},
    {firstName: "George", lastName: "Bush", "Suffix": "Senior"},
  ];

  var criteria = [
    'firstName',
    '~lastName.length',
    'suffix.charCodeAt(1)'
  ];

  multisort(inputArray, criteria)

  // input is now sorted by firstName (ascending), then lastName.length (descending),
  // and finally suffix.charCodeAt, called with 1 as the argument:
  // [
  //  {firstName: "George", lastName: "Orwell"},
  //  {firstName: "George", lastName: "Bush", "Suffix": "Senior"},
  //  {firstName: "George", lastName: "Bush", "Suffix": "Junior"},
  //  {firstName: "Kate", "lastName": "Bush"},
  // ];
  ```

  ```javascript
  var input = [8, 7, 6, 5, 4, 3, 2, 1];

  var criteria = [
    function(a) {return a % 2},
    function(a) {return a % 3},
    function(a) {return a}
  ];

  multisort(input, criteria);

  // input is now:
  // [6, 4, 2, 8, 3, 1, 7, 5]
  ```

## Partial Application

  ```javascript
  // Passing a single argument makes a sorting function that can then be applied to lists.
  var sortByMod2AndMod3 = multisort([
    function(a) {return a % 2},
    function(a) {return a % 3},
    function(a) {return a}
  ]);

  var input1 = [8, 7, 6, 5, 4, 3, 2, 1];
  sortByMod2AndMod3(input1);
  // input1 is [6, 4, 2, 8, 3, 1, 7, 5]

  var input2 = [1, 5, 10, 25, 50, 100];
  sortByMod2AndMod3(input2);
  // input2 is [10, 100, 50, 1, 25, 5]
  ```

## Features

  **Criteria types:**

  * Function - applied to each element; sort uses < and > on the results of the function.
  * String - uses < and > on the property picked out by the string.  Allows nested properties.
  * !String or ~String - like above, but sorted in descending order
  * String(arg1, arg2...) - picks out the property and calls it as a function with the given args.



## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release
