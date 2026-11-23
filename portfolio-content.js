/* Edit your name, work, biography and links here. */
(function(root){
const content={
  "identity": {
    "displayName": "Alex Morgan",
    "nameLines": [
      "ALEX",
      "MORGAN"
    ],
    "title": "Alex Morgan | Creative Portfolio",
    "description": "An independent creative portfolio. Work, experiments and ideas."
  },
  "categories": [
    {
      "title": "SELECTED WORK",
      "intro": "A selection of projects.",
      "projects": [
        {
          "approved": true,
          "title": "Sample project 01",
          "client": "Example studio",
          "location": "Your city",
          "year": "2026",
          "kind": "SAMPLE PROJECT",
          "scope": "Replace this with your role, the idea behind the project, and what you made happen.",
          "images": [
            {
              "src": "project-01.svg",
              "alt": "Abstract placeholder for sample project 1",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "",
              "credit": ""
            },
            {
              "src": "project-02.svg",
              "alt": "Second sample project image",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "Add a detail or a second view.",
              "credit": ""
            }
          ]
        },
        {
          "approved": true,
          "title": "Sample project 02",
          "client": "Example studio",
          "location": "Your city",
          "year": "2026",
          "kind": "SAMPLE PROJECT",
          "scope": "Replace this with your role, the idea behind the project, and what you made happen.",
          "images": [
            {
              "src": "project-02.svg",
              "alt": "Abstract placeholder for sample project 2",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "",
              "credit": ""
            },
            {
              "src": "project-03.svg",
              "alt": "Second sample project image",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "Add a detail or a second view.",
              "credit": ""
            }
          ]
        }
      ]
    },
    {
      "title": "EXPERIMENTS",
      "intro": "A selection of projects.",
      "projects": [
        {
          "approved": true,
          "title": "Sample project 03",
          "client": "Example studio",
          "location": "Your city",
          "year": "2026",
          "kind": "SAMPLE PROJECT",
          "scope": "Replace this with your role, the idea behind the project, and what you made happen.",
          "images": [
            {
              "src": "project-03.svg",
              "alt": "Abstract placeholder for sample project 3",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "",
              "credit": ""
            },
            {
              "src": "project-04.svg",
              "alt": "Second sample project image",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "Add a detail or a second view.",
              "credit": ""
            }
          ]
        },
        {
          "approved": true,
          "title": "Sample project 04",
          "client": "Example studio",
          "location": "Your city",
          "year": "2026",
          "kind": "SAMPLE PROJECT",
          "scope": "Replace this with your role, the idea behind the project, and what you made happen.",
          "images": [
            {
              "src": "project-04.svg",
              "alt": "Abstract placeholder for sample project 4",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "",
              "credit": ""
            },
            {
              "src": "project-05.svg",
              "alt": "Second sample project image",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "Add a detail or a second view.",
              "credit": ""
            }
          ]
        }
      ]
    },
    {
      "title": "SIDE PROJECTS",
      "intro": "A selection of projects.",
      "projects": [
        {
          "approved": true,
          "title": "Sample project 05",
          "client": "Example studio",
          "location": "Your city",
          "year": "2026",
          "kind": "SAMPLE PROJECT",
          "scope": "Replace this with your role, the idea behind the project, and what you made happen.",
          "images": [
            {
              "src": "project-05.svg",
              "alt": "Abstract placeholder for sample project 5",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "",
              "credit": ""
            },
            {
              "src": "project-06.svg",
              "alt": "Second sample project image",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "Add a detail or a second view.",
              "credit": ""
            }
          ]
        },
        {
          "approved": true,
          "title": "Sample project 06",
          "client": "Example studio",
          "location": "Your city",
          "year": "2026",
          "kind": "SAMPLE PROJECT",
          "scope": "Replace this with your role, the idea behind the project, and what you made happen.",
          "images": [
            {
              "src": "project-06.svg",
              "alt": "Abstract placeholder for sample project 6",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "",
              "credit": ""
            },
            {
              "src": "project-01.svg",
              "alt": "Second sample project image",
              "width": 1600,
              "height": 1100,
              "permission": "approved",
              "caption": "Add a detail or a second view.",
              "credit": ""
            }
          ]
        }
      ]
    }
  ],
  "about": {
    "title": "Hello, I’m Alex.",
    "lead": "Designer, maker, curious person.",
    "paragraphs": [
      "Introduce yourself here. What do you make, and what makes your approach yours?",
      "Use this space to connect your experience with the work you want to do next. Replace every sample project with your own material."
    ],
    "contact": {
      "label": "EMAIL ME",
      "href": "mailto:hello@example.com"
    },
    "portrait": {
      "src": "portrait-placeholder.svg",
      "alt": "Sample portrait placeholder",
      "width": 900,
      "height": 1200
    },
    "head": {
      "src": "head-placeholder.svg",
      "prompt": "A few more links."
    },
    "faq": [
      {
        "question": "What do you work on?",
        "answer": "Replace this answer with your own."
      },
      {
        "question": "Open to collaborations?",
        "answer": "Add your availability and interests."
      }
    ],
    "elsewhere": [
      {
        "title": "Writing",
        "description": "Things I’m thinking about",
        "href": "https://example.com/writing"
      },
      {
        "title": "Experiments",
        "description": "Things I’m trying",
        "href": "https://example.com/experiments"
      },
      {
        "title": "Instagram",
        "description": "Things I’m seeing",
        "href": "https://example.com/instagram"
      },
      {
        "title": "LinkedIn",
        "description": "My professional life",
        "href": "https://example.com/linkedin"
      }
    ]
  }
};
if(typeof module!=="undefined"&&module.exports)module.exports=content;
root.MoushettePortfolioContent=content;
})(typeof globalThis!=="undefined"?globalThis:this);
