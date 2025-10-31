# Web Origami

This is the main repository for the [Web Origami](https://weborigami.org) project, an ongoing research project that encompasses:

- A generalized programmatic interface and [pattern](https://weborigami.org/pattern/) for treating data as a particular type of [tree](<https://en.wikipedia.org/wiki/Tree_(abstract_data_type)>) called an async tree. This pattern could be used in many programming languages; Web Origami itself uses JavaScript.
- A [core library](https://weborigami.org/async-tree/) to facilitate working with async trees
- An [expression language](https://weborigami.org/language/) for creating and traversing trees and for transforming data
- A general-purpose [command-line interface](https://weborigami.org/cli/) for easily calling JavaScript from the shell, and for manipulating files and data in the shell
- A set of [builtin functions](https://weborigami.org/builtins/) for creating websites and other digital artifacts

The fundamental interface for defining a node in an async tree is small; see the first link for details. This abstraction can be applied to functions, data, file system folders, web sites, and network resources. This permits the creation of a large set of tools that can traverse such trees, letting you as a developer work with them at a higher level.

# Respectful open source participation

If you are thinking of using this project, please read the following.

Open source projects are messy interpersonal endeavors with the extra challenge of incorporating participants who are often complete strangers. Sadly, it's common among open source projects to see a great deal of terrible interpersonal behavior. None of us should have to accept that.

To be clear then, here is the relationship that I (Jan, the person who initiated this project) expect to have with anyone who wants to participate in this project in any way.

- Before we know each other, you and I owe each other _nothing_ beyond the basic politeness and respect we owe everyone.
- I've contributed to this project to help people, but I'm not a free resource that exists to serve your needs.
- I have my own goals, and they are almost certainly at least a little different than yours. To the extent our goals align, we may both benefit; if not, you don't need to use this.
- What I get out of our relationship: a sense of having helped people, maaaaaybe some idea or bug fix that I'll find useful.
- What you get out of our relationship: a headstart on your own project, without which you might not be able to meet your goals. You may also receive some assistance from me if I can afford it. If you contribute something back, you can get the same sense of having helped people that I get.
- I will strive to treat you, a complete stranger, with respect.
- In return, you have to treat me and my time with respect.
- Bugs are a lousy way to say hello. If you investigate this project and decide to make use of it, please [contact me](https://jan.miksovsky.com/contact.html) and say hello before filing a bug, pull request, etc. I would enjoy hearing about how you are using (or intend to use) this project.
- If you file a bug and it sounds like a complaint to me, you're just going to make me feel bad. I will probably close the bug; no one deserves that kind of grief from strangers.
- If you file a suggestion, please understand that it is likely harder to implement than you believe, or may conflict with my goals even if it advances yours. I may have my own reasons for not taking the suggestion.
- If you file a pull request, I will do my best to assess it and, if it aligns with my own goals, accept it. The amount of time you invest in an unsolicited pull request does not determine whether I will accept it. Before investing significant time on a pull request, it's reasonable to check first whether it's likely to be accepted.
- Your crisis is not my emergency. If you file a bug or pull request and I can't get to it as fast as you want — or possibly ever — that's obviously disappointing but not justification for anger or abuse.
- This is open source. At any point you're free to fork this project, walk away, and do what you want with it (subject to the [license](LICENSE)). Or use something else. No one is making you use this.

If you can't accept this relationship, please don't use this project.

For practical aspects of contributing to the project, see [Contributing](Contributing.md).

# Discussion

If you'd like to ask questions, visit the [Web Origami room](https://matrix.to/#/%23weborigami:envs.net) on [Matrix](https://matrix.org).

# Acknowledgments

Many thanks to the people who contributed their time to watch a demo, provide feedback, review documentation, ask questions, offer suggestions, participate in a playtest, point other people toward the project, etc. This isn't to say these people endorse Web Origami, but to say that they helped the project in some way. Their time and thoughts are deeply appreciated.

Chris Zimmerman ・ Rob Bearman ・ Derik Stenerson ・ Bruce Oberg ・ Alex Russell ・ Jade Pennig ・ Wolfram Kriesing ・ Dan Clark ・ Nolan Lawson ・ Eric Candell ・ Robby Ingebretsen ・ Joel Fillmore ・ Lee White ・ Bill Barnes ・ Brandon Ferrua ・ Pierre-Marie Dartus ・ Liron Shapira ・ Chris Miksovsky ・ Will Friedman ・ Josie Bolotski ・ Peter Chane ・ Emilis Dambauskas ・ Nick Simson ・ Mia Wilson ・ Anders Hejlsberg ・ Joe Belfiore ・ Liam Bigelow ・ Brad Frost ・ Jim Nielsen ・ Mike Neumegen ・ Lee Mighdoll ・ Luke LaValva ・ Sashin ・ Declan Chidlow ・ Hasan Atak ・ Hans Fast ・ Nick Demarest
