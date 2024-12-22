export const PARAMETER_REFERENCE = {
  coreStructure: {
    title: {
      definition: "The novel's name, reflecting central theme or tone",
      storyInfluence: [
        "Serves as conceptual anchor for narrative style/focus",
        "Can hint at major themes, conflicts, or setting aesthetic"
      ],
      examples: [
        '"Shadows of Elysium": Implies a mysterious, possibly fantasy setting with dark undertones.',
        '"City of Scattered Stars": Suggests a futuristic or cosmic scope.'
      ],
      guidance: "Keep it thematically consistent with genre & style. If comedic, consider a witty/pun-based title; if dark or epic, choose something more dramatic."
    },
    storyDescription: {
      definition: "A brief (~500 chars) synopsis or elevator pitch describing the novel’s core premise.",
      storyInfluence: [
        "Guides how the opening chapters are established.",
        "Specific or detailed descriptions narrow the AI’s focus; vague descriptions allow more creative latitude."
      ],
      examples: [
        '"A lone wanderer must save a crumbling kingdom."',
        '"In the floating city of Atrum, a rebellious scholar uncovers a conspiracy that blurs lines between magic and technology."'
      ],
      guidance: "If very detailed, mention key conflicts or a unique twist to incorporate early."
    },
    novelLength: {
      values: [
        "50k-100k words",
        "100k-150k words",
        "150k+ words"
      ],
      influenceOnOutline: {
        "50k-100k": "Usually 10–20 chapters total; covers straightforward arcs.",
        "100k-150k": "Expands subplots, up to ~20–30 chapters; deeper exploration.",
        "150k+": "Often 30+ chapters or multi-part structure; more complex arcs."
      },
      examples: [
        "A single-protagonist quest might fit well in 50k-100k.",
        "A multi-faction epic often suits 150k+."
      ],
      considerations: "Longer lengths demand more subplots, backstory, or world detail."
    },
    chapterStructure: {
      values: [
        "Fixed length",
        "Variable length"
      ],
      storyInfluence: {
        fixed: "Consistent pacing and chapter size, more methodical structure.",
        variable: "Allows short, intense chapters and longer, exploratory chapters."
      },
      examples: [
        "Each chapter is ~2,500 words, for a neat 50k total in 20 chapters.",
        "Chapters may range from 1k–5k words, letting tension ebb and flow dramatically."
      ],
      guidance: "Variable can feel more dynamic, but fixed is often easier to pace for linear arcs."
    },
    averageChapterLength: {
      definition: "Approximate word count per chapter (e.g., 2k, 3k, 5k words).",
      influence: "Affects how many total chapters you’ll need for a chosen novel length.",
      examples: [
        "1,500 words → quick read, possibly suitable for fast action or YA style.",
        "4,000 words → each chapter is more in-depth, with multiple scenes or subplots."
      ]
    }
  },
  genreTheme: {
    primaryGenre: {
      fantasy: {
        subGenres: [
          "High Fantasy",
          "Urban Fantasy",
          "Dark Fantasy",
          "Epic Fantasy"
        ],
        influence: [
          "Emphasizes world-building, magic, cultural detail.",
          "High/Epic → grand quests, multiple kingdoms, large-scale conflicts.",
          "Urban → modern city environment + hidden or integrated magic.",
          "Dark → grim tone, possibly horror elements or moral bleakness."
        ],
        examples: [
          "High Fantasy with multi-race realms, complex mythologies.",
          "Urban Fantasy set in a real-world city with supernatural pockets."
        ]
      },
      scienceFiction: {
        subGenres: [
          "Space Opera",
          "Cyberpunk",
          "Post-Apocalyptic",
          "Hard Sci-Fi"
        ],
        influence: [
          "Tech-oriented stories with futuristic or alternate reality elements.",
          "Space Opera → galactic scale, advanced civilizations.",
          "Cyberpunk → dystopian cityscapes, corporate tyranny, tech-human conflict.",
          "Post-Apocalyptic → survival, collapsed societies, scavenger arcs.",
          "Hard Sci-Fi → realism, thorough exploration of scientific principles."
        ],
        examples: [
          "Cyberpunk + Detective Mystery synergy: hacking-based whodunit."
        ]
      },
      mystery: {
        subGenres: [
          "Detective",
          "Cozy Mystery",
          "Noir",
          "Thriller"
        ],
        influence: [
          "Puzzle-like structure, clue distribution, tension arcs.",
          "Detective → protagonist actively investigating.",
          "Cozy Mystery → small community, lighter tone, minimal graphic content.",
          "Noir → gritty settings, moral ambiguity, cynicism.",
          "Thriller → higher stakes, intense pacing."
        ],
        examples: [
          "Cozy Mystery in a quaint seaside town with comedic undertones."
        ]
      },
      romance: {
        subGenres: [
          "Contemporary",
          "Historical",
          "Paranormal",
          "Romantic Comedy"
        ],
        influence: [
          "Focus on relationship arcs, emotional tension, intimacy.",
          "Historical → period detail essential.",
          "Paranormal → supernatural or fantasy romance (vampires, ghosts, etc.)."
        ],
        examples: [
          "Historical romance in Victorian England with social constraints."
        ]
      },
      literaryFiction: {
        subGenres: [
          "Contemporary Fiction",
          "Historical Fiction",
          "Experimental",
          "Satire"
        ],
        influence: [
          "Emphasizes character introspection, thematic depth, or stylistic experimentation.",
          "Satire → comedic but pointed social commentary."
        ],
        examples: [
          "Contemporary slice-of-life focusing on family drama."
        ]
      }
    },
    themes: {
      possibleValues: [
        "Coming of Age",
        "Redemption",
        "Love and Loss",
        "Power and Corruption",
        "Identity",
        "Good vs Evil"
      ],
      influence: [
        "Shapes character arcs and moral core.",
        "Coming of Age → personal growth, mentor-student relationships.",
        "Good vs Evil → clearly delineated moral conflict, heroic stand-offs.",
        "Power and Corruption → moral complexity, political or personal corruption arcs."
      ],
      examples: [
        "Mystery + Redemption: detective with a troubled past, solving cases for atonement.",
        "Fantasy + Identity: chosen one discovering lineage or inherent powers."
      ]
    }
  },
  writingStyle: {
    toneAndStyle: {
      definition: "Overall emotional tone of the narrative.",
      values: [
        "1 = Light, comedic, or uplifting",
        "5 = Very dark, grim, or bleak"
      ],
      influence: "Affects descriptive word choice, atmosphere, comedic vs. serious arcs.",
      examples: [
        "2 might have occasional humor, but generally serious.",
        "4 is intense, dramatic, or tense throughout."
      ]
    },
    formalityLevel: {
      definition: "Language style, from casual to highly formal or archaic.",
      examples: [
        "1 = Modern slang, short sentences, casual speech.",
        "5 = Very formal or archaic, typically found in historical or epic fantasy contexts."
      ]
    },
    descriptiveDetail: {
      definition: "How richly the narrative describes scenes, characters, environments.",
      values: [
        "1 = Lean, minimal descriptive text",
        "5 = Lavish, immersive detail"
      ],
      influence: "High detail demands more word count for setting portrayal, environment mood."
    },
    dialogueBalance: {
      definition: "Ratio of dialogue to narration.",
      values: [
        "1 = Minimal dialogue, more descriptive or action-based",
        "5 = Dialogue-heavy, characters constantly interact verbally"
      ],
      influence: "High dialogue can accelerate character development and comedic or dramatic tension."
    },
    descriptionDensity: {
      definition: "Specifically how dense the environment/world depiction is beyond basic exposition.",
      influence: "5 = Scenes may start with extensive environmental setups, strong sense of place."
    },
    pacingAndFlow: {
      overallPacing: {
        definition: "Overall pacing of the story.",
        values: [
          "1 = Very slow burn",
          "5 = Rapid, high-action"
        ]
      },
      pacingVariance: {
        definition: "Variance in pacing throughout the story.",
        values: [
          "1 = Very consistent pacing",
          "5 = Swings wildly between slow sections and intense bursts"
        ]
      }
    },
    literaryDevices: {
      emotionalIntensity: {
        definition: "Level of emotional engagement in the narrative.",
        values: [
          "1 = Subdued emotions",
          "5 = Highly dramatic, big emotional swings"
        ]
      },
      metaphorFrequency: {
        definition: "Frequency of metaphorical language.",
        values: [
          "1 = Straightforward language",
          "5 = Flourishes of metaphor and poetic elements"
        ]
      },
      flashbackUsage: {
        definition: "Usage of flashbacks in the narrative.",
        values: [
          "1 = Rare or none",
          "5 = Frequent timeline jumps to reveal backstory"
        ]
      },
      foreshadowingIntensity: {
        definition: "Intensity of foreshadowing throughout the story.",
        values: [
          "1 = Very subtle or minimal",
          "5 = Overt, consistent hints about future revelations"
        ]
      }
    }
  }
};
