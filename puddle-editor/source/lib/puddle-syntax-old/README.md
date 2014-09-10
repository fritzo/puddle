[![Build Status](https://travis-ci.org/fritzo/puddle-syntax.svg?branch=master)](http://travis-ci.org/fritzo/puddle-syntax)
[![NPM Version](https://badge.fury.io/js/puddle-syntax.svg)](https://www.npmjs.org/package/puddle-syntax)
[![NPM Dependencies](https://david-dm.org/fritzo/puddle-syntax.svg)](https://www.npmjs.org/package/puddle-syntax)

# puddle-syntax

Syntax tools for the
[Puddle](https://github.com/fritzo/puddle) coding environment

## API Reference

    var syntax = require('puddle-syntax');

* [Data Formats](#formats): Codes, Terms, and Trees
* [Module `syntax.compiler`](#compiler): syntactic algorithms
* [Module `syntax.fragments`](#fragments): subsets of `compiler.symbols`
* [Module `syntax.pretty`](#pretty): pretty printing
* [Module `syntax.tree`](#tree): tree data structures
* [Module `syntax.cursor`](#cursor): operations on cursor nodes
* [Module `syntax.tokens`](#tokens): tools for token classification

### Data Formats <a name="formats"/>

This module deals with three formats of data.

1.  Codes - Immutable space-delimited lists of tokens.

    **JSON Serializable:** yes

    **Examples:**

        "I"

        "VAR x"

        "APP VAR f VAR x"

        "DEFINE VAR two LAMBDA VAR f LAMBDA VAR x APP VAR f APP VAR f VAR x"

        "ASSERT EQUAL APP VAR two I I"

2.  Terms - Immutable array-representations of abstract syntax trees.

    **JSON Serializable:** yes

    **Examples:**

        [
            "DEFINE", ["VAR", "two"], [
                "LAMBDA", ["VAR", "f"], [
                    "LAMBDA", ["VAR", "x"], [
                        "APP", ["VAR" "f"], [
                            "APP", ["VAR" "f"], ["VAR" "x"],
                        ]
                    ]
                ]
            ]
        ]

        [
            "ASSERT", [
                "EQUAL", ["APP", ["VAR", "two"], "I"], "I"
            ]
        ]

3.  Trees - Mutable cross-linked abstract syntax trees for easy traversal.

    **JSON Serializable:** no, because of cycles

    **Examples:**

        {"name": "I", "above": null, "below": []}

        {"name": "VAR", "varName": "x", "above": null, "below": []}

        var fx = {
            "name": "APP",
            "above": null,
            "below": [
                {"name": "VAR", "varName": "f", "below": [], "above": fx},
                {"name": "VAR", "varName": "x", "below": [], "above": fx}
            ]
        };

### Module `syntax.compiler` <a name="compiler"/>

Signature:

    compiler.symbols : object(string | function) (constructors for terms)
    compiler.print : term -> string
    compiler.parse : string -> term
    compiler.load : code -> term  // compatible with pomagma analyst
    compiler.dump : term -> code  // compatible with pomagma analyst
    compiler.enumerateFresh : int -> string (a variable name)
    compiler.substitute : name * term * term -> nil
    compiler.parenthesize : term -> term
    compiler.fold : /\f: (string * any -> t). term -> t

Examples:

    compiler.load("APP VAR f VAR x");
    // = ["APP", ["VAR", "f"], ["VAR", "x"]]

    compiler.dump(["APP", ["VAR", "f"], ["VAR", "x"]]);
    // = "APP VAR f VAR x"

    compiler.enumerateFresh(0);  // = "a"
    compiler.enumerateFresh(1);  // = "b"
    compiler.enumerateFresh(2);  // = "c"

    compiler.substitute(name, def, body);

### Module `syntax.fragments` <a name="fragments"/>

Signature:

    fragments.combinators : subset of compiler.symbols
    fragments.lambda : subset of compiler.symbols

### Function `syntax.pretty` <a name="pretty"/>

Signature:

    pretty : term -> string

Examples:

    pretty(["LAMBDA, ["VAR", "x"], ["APP", ["VAR", "f"], ["VAR", "x"]]]);
    // = "\ x f x"

### Module `syntax.tree` <a name="tree"/>

Signature:

    tree.load : term -> tree node
    tree.dump : tree node -> term
    getRoot : tree node -> tree node
    getLocals : tree node -> Array of strings (variable names)
    getFresh : tree node -> string (a variable name)

Examples:

    tree.load(["VAR", "x"]);
    // = {"name": "VAR", "varName": "x", "above": null, "below": []}

    tree.dump({"name": "VAR", "varName": "x", "above": null, "below": []});
    // = ["VAR", "x"]

    var root = tree.getRoot(node);
    var varList = tree.getBoundAbove(term);  // -> ["a", "b"]
    var varSet = tree.getVars(term);         // -> {"a": null, "b": null}
    var name = tree.getFresh(term);          // -> "c"

### Module `syntax.cursor` <a name="cursor"/>

Signature:

    create : nil -> cursor node
    remove : cursor node -> nil
    insertAbove : cursor node * tree node -> nil
    replaceBelow : cursor node * tree node -> nil
    tryMove : cursor node * direction -> bool (direction one of "U" "D" "L" "R")

Examples:

    var direction = "U";  // or "D", "L", "R"
    var success = syntax.cursor.tryMove(cursor, direction);

### Module `syntax.tokens` <a name="tokens"/>

Signature:

    tokens.isToken : string -> bool
    tokens.isKeyword : string -> bool
    tokens.isLocal : string -> bool
    tokens.isGlobal : string -> bool
    tokens.isFreeVariables : string -> object (set of free vars)

Examples:

    assert(tokens.isToken("a"));
    assert(tokens.isKeyword("JOIN"));
    assert(tokens.isLocal("a"));
    assert(tokens.isGlobal("util.pair"));

    tokens.getFreeVariables("APP VAR unqualified VAR fully.qualified.name");
    // -> {"fully.qualified.name": null}

## License

Copyright 2013-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).
