# Puddle: Introduction

Puddle is an editor for an extension of
[&lambda;-calculus](http://en.wikipedia.org/wiki/Lambda_calculus),
Alanzo Church's functional programming language circa 1931.
[Pomagma](https://github.com/fritzo/pomagma) is an inference engine for
[combinatory logic](),
Sh&ouml;nfinkel and Curry's functional programming language circa 1920s.
Felice Cardone and Roger Hindley have written a
[wonderful survey](http://www.pps.univ-paris-diderot.fr/~saurin/Enseignement/LMFI/articles/HindleyCardone06.pdf) of the history of both languages.
See [Pomagma's Philosophy](https://github.com/fritzo/pomagma/blob/master/doc/philosophy.md) for further information.

Much of Puddle's code deals with **compiling**
from &lambda;-calculus to combinatory algebra and **decompiling** back.
When the puddle **editor** (the browser client) loads the **corpus**,
it decompiles it into lambda form.
The lambda form what the user sees and edits.

Puddle's **corpus** is body of code in combinatory form
consisting of a set of **statements** or **lines**.
Each line is either an **assertion** or a **definition**.
Definitions have names, and assertions are anonymous.
The meaning of each line depends on the definitions of **variables**
referenced in that line.

Each line's meaning is either **valid** or **invalid**,
and there are two types of invalid lines: **overdefined** and **underdefined**
(corresponding to `validity.is_top` and `validity.is_bot`, respectively).
The Pomagma engine that tries to determine
whether each line is valid or invalid.
Sometimes the engine cannot decide;
sometimes it can decide that a term is not overdefined but may be underdefined;
sometimes it can decide that a term may be overdefined but is not underdefined.
Puddle conveys this partial validity state via validity icons:

| Symbol  | Color  | Overdefined?  | Underdefined? | Valid?        |
|---------|--------|---------------|---------------|---------------|
| (none)  |        | no            | no            | yes           |
| &x2B52; | gray   | no            | yet undecided | yet undecided |
| &x2B5C; | gray   | yet undecided | no            | yet undecided |
| &x25a0; | gray   | yet undecided | yet undecided | yet undecided |
| &x2B52; | yellow | no            | cannot decide | cannot decide |
| &x2B5C; | yellow | cannot decide | cannot decide | cannot decide |
| &x25a0; | yellow | cannot decide | cannot decide | cannot decide |
| &x2B52; | red    | no            | yes           | no            |
| &x2B5C; | red    | yes           | no            | no            |
