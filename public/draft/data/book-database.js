const booksDatabase = {
  "the-stranger": {
    id: "the-stranger",
    title: "The Stranger",
    author: "Albert Camus",
    punchline: "Mother died today. Or maybe yesterday; I can't be sure.",
    summary: [
      "With these chillingly detached words begins one of the most haunting novels of the twentieth century.",
      "Meursault, a quiet office worker in Algiers, lives a life untouched by conventional emotions. When his mother dies, he feels nothing. When he commits a sudden act of violence under the blinding sun, he feels little more. Yet it is not his crime that condemns him—it is his honesty, his refusal to pretend.",
      "In The Stranger, Camus exposes the absurdity of existence and the moral emptiness of a world that punishes sincerity. With stark, crystalline prose, he invites readers to face the unbearable truth of being: that life has no inherent meaning—and that freedom begins only when we accept it.",
      "A brief novel that lingers long after the final page, The Stranger is both a philosophical awakening and a mirror held up to humanity's quiet indifference."
    ],
    categories: ["Philosophy", "Literature", "Absurdism", "French Literature", "Existentialism"],
    rating: {
      average: 4.2,
      totalRatings: 1523,
      distribution: { 5: 892, 4: 431, 3: 156, 2: 32, 1: 12 }
    },
    structure: "parts",
    contents: [
      {
        type: "part",
        title: "PART 01",
        chapters: [
          { number: 1, title: "Chapter 1", url: "/read/the-stranger/part1-ch1" },
          { number: 2, title: "Chapter 2", url: "/read/the-stranger/part1-ch2" },
          { number: 3, title: "Chapter 3", url: "/read/the-stranger/part1-ch3" },
          { number: 4, title: "Chapter 4", url: "/read/the-stranger/part1-ch4" },
          { number: 5, title: "Chapter 5", url: "/read/the-stranger/part1-ch5" },
          { number: 6, title: "Chapter 6", url: "/read/the-stranger/part1-ch6" }
        ]
      },
      {
        type: "part",
        title: "PART 02",
        chapters: [
          { number: 1, title: "Chapter 1", url: "/read/the-stranger/part2-ch1" },
          { number: 2, title: "Chapter 2", url: "/read/the-stranger/part2-ch2" },
          { number: 3, title: "Chapter 3", url: "/read/the-stranger/part2-ch3" },
          { number: 4, title: "Chapter 4", url: "/read/the-stranger/part2-ch4" },
          { number: 5, title: "Chapter 5", url: "/read/the-stranger/part2-ch5" }
        ]
      }
    ],
    comments: [
      {
        id: "c1",
        username: "user_name",
        avatar: "default",
        date: "2025-01-20T22:54:00",
        text: "Comment section follows the rule, censored banned words...",
        likes: 12,
        replies: 19
      }
    ],
    relatedBooks: ["the-plague", "myth-of-sisyphus", "no-exit", "metamorphosis"],
    cover: {
      type: "svg",
      design: `<g transform="translate(150, 120)">
        <path d="M 0,0 L -30,-80 L -20,-85 Z" fill="black"/>
        <path d="M 0,0 L -10,-85 L 0,-90 Z" fill="black"/>
        <path d="M 0,0 L 10,-85 L 20,-85 Z" fill="black"/>
        <path d="M 0,0 L 30,-80 L 40,-75 Z" fill="black"/>
        <path d="M 0,0 L 50,-70 L 60,-60 Z" fill="black"/>
        <path d="M 0,0 L 70,-50 L 75,-40 Z" fill="black"/>
        <path d="M 0,0 L 80,-30 L 82,-20 Z" fill="black"/>
        <path d="M 0,0 L 85,-10 L 85,0 Z" fill="black"/>
        <path d="M 0,0 L 85,10 L 82,20 Z" fill="black"/>
        <path d="M 0,0 L 80,30 L 75,40 Z" fill="black"/>
        <path d="M 0,0 L 70,50 L 60,60 Z" fill="black"/>
        <path d="M 0,0 L 50,70 L 40,75 Z" fill="black"/>
        <path d="M 0,0 L 30,80 L 20,85 Z" fill="black"/>
        <path d="M 0,0 L 10,85 L 0,90 Z" fill="black"/>
        <path d="M 0,0 L -10,85 L -20,85 Z" fill="black"/>
        <path d="M 0,0 L -30,80 L -40,75 Z" fill="black"/>
        <path d="M 0,0 L -50,70 L -60,60 Z" fill="black"/>
        <path d="M 0,0 L -70,50 L -75,40 Z" fill="black"/>
        <path d="M 0,0 L -80,30 L -82,20 Z" fill="black"/>
        <path d="M 0,0 L -85,10 L -85,0 Z" fill="black"/>
        <path d="M 0,0 L -85,-10 L -82,-20 Z" fill="black"/>
        <path d="M 0,0 L -80,-30 L -75,-40 Z" fill="black"/>
        <path d="M 0,0 L -70,-50 L -60,-60 Z" fill="black"/>
        <path d="M 0,0 L -50,-70 L -40,-75 Z" fill="black"/>
      </g>`
    }
  },
  
  "mans-search": {
    id: "mans-search",
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    punchline: null,
    summary: [
      "Psychiatrist Viktor Frankl's memoir has riveted generations of readers with its descriptions of life in Nazi death camps and its lessons for spiritual survival.",
      "Between 1942 and 1945 Frankl labored in four different camps, including Auschwitz, while his parents, brother, and pregnant wife perished.",
      "Based on his own experience and the experiences of others he treated later in his practice, Frankl argues that we cannot avoid suffering but we can choose how to cope with it, find meaning in it, and move forward with renewed purpose."
    ],
    categories: ["Psychology", "Philosophy", "Memoir", "Holocaust", "Non-fiction"],
    rating: {
      average: 4.8,
      totalRatings: 2341,
      distribution: { 5: 1823, 4: 412, 3: 89, 2: 12, 1: 5 }
    },
    structure: "chapters",
    contents: [
      { type: "chapter", number: 1, title: "Experiences in a Concentration Camp", url: "/read/mans-search/ch1" },
      { type: "chapter", number: 2, title: "Logotherapy in a Nutshell", url: "/read/mans-search/ch2" },
      { type: "chapter", number: 3, title: "The Case for a Tragic Optimism", url: "/read/mans-search/ch3" }
    ],
    comments: [],
    relatedBooks: ["the-stranger", "crime-punishment", "bell-jar"],
    cover: {
      type: "image",
      url: "images/mans-search.jpg"
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = booksDatabase;
}