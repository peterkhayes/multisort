Multitest
=========

A small library for sorting arrays by multiple criteria.

## Installation

  npm install multitest --save

## Usage

  // Array to sort.
  var input = [
    {firstName: "Kate", "lastName": "Bush"},
    {firstName: "George", lastName: "Bush", "Suffix": "Jr"},
    {firstName: "George", lastName: "Orwell"},
    {firstName: "George", lastName: "Bush", "Suffix": "Sr"},
  ];

  // Any number of criteria - can be functions or strings matching properties.
  var criteria = [
    'firstName',
    'lastName.length',
    function(person) {return person.suffix === "Sr" ? 1 : 0}
  ];

  multisort(inputArray, criteria)
  // input is now:
  // [
  //  {firstName: "George", lastName: "Bush", "Suffix": "Jr"},
  //  {firstName: "George", lastName: "Bush", "Suffix": "Sr"},
  //  {firstName: "George", lastName: "Orwell"},
  //  {firstName: "Kate", "lastName": "Bush"},
  // ];

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release