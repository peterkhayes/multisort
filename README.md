Multitest
=========

A small library for sorting arrays by multiple criteria.

## Installation

  npm install multisort --save

## Basic Usage

  ```javascript
  var input = [
    {firstName: "Kate", "lastName": "Bush"},
    {firstName: "George", lastName: "Bush", "Suffix": "Jr"},
    {firstName: "George", lastName: "Orwell"},
    {firstName: "George", lastName: "Bush", "Suffix": "Sr"},
  ];

  var criteria = [
    'firstName',
    '~lastName.length', // ! or ~ sorts descending
    function(person) { return person.suffix.charCodeAt(0) }
  ];

  multisort(inputArray, criteria)

  // input is now:
  // [
  //  {firstName: "George", lastName: "Orwell"},
  //  {firstName: "George", lastName: "Bush", "Suffix": "Jr"},
  //  {firstName: "George", lastName: "Bush", "Suffix": "Sr"},
  //  {firstName: "Kate", "lastName": "Bush"},
  // ];
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
