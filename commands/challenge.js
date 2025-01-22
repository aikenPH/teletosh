const crypto = require('crypto');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

class ChallengeGenerator {
  constructor() {
    this.challenges = {
      coding: [
  {
    title: "Hello World Program",
    difficulty: "Beginner",
    description: "Write a program that prints 'Hello, World!' to the console.",
    languages: ["JavaScript", "Python", "Java"],
    timeLimit: "15 minutes"
  },
  {
    title: "Array Sum Calculator",
    difficulty: "Beginner", 
    description: "Create a function that calculates the sum of all numbers in an array.",
    languages: ["JavaScript", "Python", "Ruby"],
    timeLimit: "20 minutes"
  },
  {
    title: "Palindrome Checker",
    difficulty: "Intermediate",
    description: "Create a function that checks if a given string is a palindrome.",
    languages: ["JavaScript", "Python", "Java"],
    timeLimit: "30 minutes"
  },
  {
    title: "Fibonacci Generator",
    difficulty: "Intermediate",
    description: "Implement an efficient function to generate Fibonacci sequence up to n terms.",
    languages: ["C++", "Ruby", "Go"],
    timeLimit: "45 minutes"
  },
  {
    title: "Binary Tree Implementation",
    difficulty: "Advanced",
    description: "Implement a complete binary tree with insertion, deletion, and traversal.",
    languages: ["Java", "C++", "Python"],
    timeLimit: "90 minutes"
  },
  {
    title: "Prime Number Generator",
    difficulty: "Beginner",
    description: "Write a function to generate prime numbers up to a given limit.",
    languages: ["Python", "JavaScript", "Java"],
    timeLimit: "25 minutes"
  },
  {
    title: "String Reversal",
    difficulty: "Beginner",
    description: "Create a function that reverses a given string without using built-in reverse methods.",
    languages: ["C++", "Ruby", "Swift"],
    timeLimit: "20 minutes"
  },
  {
    title: "Basic Calculator",
    difficulty: "Beginner",
    description: "Develop a simple calculator that performs basic arithmetic operations.",
    languages: ["Python", "JavaScript", "Java"],
    timeLimit: "35 minutes"
  },
  {
    title: "Armstrong Number Checker",
    difficulty: "Intermediate",
    description: "Write a program to check if a number is an Armstrong number.",
    languages: ["C", "Go", "Rust"],
    timeLimit: "40 minutes"
  },
  {
    title: "Anagram Detector",
    difficulty: "Intermediate",
    description: "Create a function that determines if two strings are anagrams.",
    languages: ["Python", "JavaScript", "Java"],
    timeLimit: "35 minutes"
  },
  {
    title: "Simple Contact Management System",
    difficulty: "Intermediate",
    description: "Build a console-based contact management system with add, view, and delete functionality.",
    languages: ["C++", "Java", "Python"],
    timeLimit: "60 minutes"
  },
  {
    title: "Linked List Implementation",
    difficulty: "Advanced",
    description: "Create a complete linked list data structure with all standard operations.",
    languages: ["C", "C++", "Java"],
    timeLimit: "90 minutes"
  },
  {
    title: "Merge Sort Implementation",
    difficulty: "Advanced",
    description: "Implement the merge sort algorithm with recursive and iterative approaches.",
    languages: ["Python", "Java", "C++"],
    timeLimit: "75 minutes"
  },
  {
    title: "Simple Web Scraper",
    difficulty: "Intermediate",
    description: "Build a basic web scraper that extracts specific information from a website.",
    languages: ["Python", "JavaScript", "Ruby"],
    timeLimit: "50 minutes"
  },
  {
    title: "Caesar Cipher Encryption",
    difficulty: "Intermediate",
    description: "Implement a Caesar cipher encryption and decryption algorithm.",
    languages: ["Java", "Python", "Go"],
    timeLimit: "45 minutes"
  },
  {
    title: "Simple Task Scheduler",
    difficulty: "Intermediate",
    description: "Create a task scheduling application with priority and deadline management.",
    languages: ["Python", "Java", "C#"],
    timeLimit: "70 minutes"
  },
  {
    title: "Recursive Directory Traversal",
    difficulty: "Advanced",
    description: "Develop a program that recursively traverses and lists files in a directory.",
    languages: ["Python", "Go", "Rust"],
    timeLimit: "60 minutes"
  },
  {
    title: "Basic Neural Network",
    difficulty: "Advanced",
    description: "Implement a simple neural network from scratch without using machine learning libraries.",
    languages: ["Python", "NumPy", "Julia"],
    timeLimit: "120 minutes"
  },
  {
    title: "Distributed Key-Value Store",
    difficulty: "Advanced",
    description: "Design a basic distributed key-value store with basic consensus mechanism.",
    languages: ["Go", "Erlang", "Rust"],
    timeLimit: "180 minutes"
  },
  {
    title: "Simple Compiler",
    difficulty: "Advanced",
    description: "Create a basic compiler for a simple programming language.",
    languages: ["Haskell", "Rust", "C++"],
    timeLimit: "240 minutes"
  },
  {
  title: "Sudoku Solver",
  difficulty: "Advanced",
  description: "Implement a backtracking algorithm to solve Sudoku puzzles dynamically.",
  languages: ["Python", "Java", "Kotlin"],
  timeLimit: "120 minutes"
},
{
  title: "Genetic Algorithm Optimizer",
  difficulty: "Advanced",
  description: "Create a genetic algorithm to optimize a complex optimization problem.",
  languages: ["Python", "JavaScript", "Julia"],
  timeLimit: "180 minutes"
},
{
  title: "Real-time Chat Encryption System",
  difficulty: "Advanced",
  description: "Develop an end-to-end encrypted messaging system with key exchange protocol.",
  languages: ["Rust", "Go", "C++"],
  timeLimit: "150 minutes"
},
{
  title: "Blockchain Simple Implementation",
  difficulty: "Advanced",
  description: "Create a basic blockchain with proof-of-work and block validation.",
  languages: ["Python", "JavaScript", "Go"],
  timeLimit: "180 minutes"
},
{
  title: "Parallel Image Processing Tool",
  difficulty: "Advanced",
  description: "Build a multi-threaded image processing application with various filters.",
  languages: ["C++", "Rust", "Java"],
  timeLimit: "120 minutes"
},
{
  title: "Natural Language Parsing Engine",
  difficulty: "Advanced",
  description: "Develop a basic natural language parser with syntax tree generation.",
  languages: ["Haskell", "Python", "Scala"],
  timeLimit: "200 minutes"
},
{
  title: "Quantum Circuit Simulator",
  difficulty: "Advanced",
  description: "Implement a basic quantum circuit simulator with common quantum gates.",
  languages: ["Python", "Julia", "Q#"],
  timeLimit: "240 minutes"
},
{
  title: "Autonomous Drone Path Planning",
  difficulty: "Advanced",
  description: "Create an algorithm for autonomous drone navigation with obstacle avoidance.",
  languages: ["Python", "ROS", "C++"],
  timeLimit: "180 minutes"
},
{
  title: "Predictive Stock Market Model",
  difficulty: "Advanced",
  description: "Develop a machine learning model for basic stock price prediction.",
  languages: ["Python", "TensorFlow", "R"],
  timeLimit: "210 minutes"
},
{
  title: "Distributed Consensus Algorithm",
  difficulty: "Advanced",
  description: "Implement a Raft or Paxos consensus algorithm simulation.",
  languages: ["Erlang", "Go", "Rust"],
  timeLimit: "240 minutes"
},
{
  title: "Advanced Compression Algorithm",
  difficulty: "Advanced",
  description: "Create a custom data compression algorithm with efficient encoding.",
  languages: ["C", "Rust", "Go"],
  timeLimit: "180 minutes"
},
{
  title: "Neural Style Transfer Implementation",
  difficulty: "Advanced",
  description: "Develop an algorithm that transfers artistic styles between images.",
  languages: ["Python", "PyTorch", "TensorFlow"],
  timeLimit: "210 minutes"
},
{
  title: "Automated Code Refactoring Tool",
  difficulty: "Advanced",
  description: "Build a tool that automatically identifies and suggests code improvements.",
  languages: ["Python", "Scala", "Haskell"],
  timeLimit: "240 minutes"
},
{
  title: "Real-time Strategy Game AI",
  difficulty: "Advanced",
  description: "Create an intelligent AI for a real-time strategy game scenario.",
  languages: ["C++", "Python", "Lua"],
  timeLimit: "180 minutes"
},
{
  title: "Distributed Machine Learning Framework",
  difficulty: "Advanced",
  description: "Design a basic distributed machine learning training framework.",
  languages: ["Python", "Scala", "Go"],
  timeLimit: "240 minutes"
},
{
  title: "Advanced Cryptography System",
  difficulty: "Advanced",
  description: "Implement an advanced encryption system with novel key exchange mechanism.",
  languages: ["Rust", "C++", "Go"],
  timeLimit: "210 minutes"
},
{
  title: "Autonomous Robotics Path Planning",
  difficulty: "Advanced",
  description: "Develop an advanced path planning algorithm for robotic navigation.",
  languages: ["Python", "ROS", "C++"],
  timeLimit: "180 minutes"
},
{
  title: "Complex Network Simulation",
  difficulty: "Advanced",
  description: "Create a sophisticated social network simulation with behavior modeling.",
  languages: ["Python", "Julia", "Scala"],
  timeLimit: "210 minutes"
},
{
  title: "Advanced Compiler Optimization",
  difficulty: "Advanced",
  description: "Develop a compiler optimization technique for performance improvement.",
  languages: ["Rust", "Haskell", "C++"],
  timeLimit: "240 minutes"
},
{
  title: "Quantum Cryptography Simulator",
  difficulty: "Advanced",
  description: "Implement a quantum key distribution simulation.",
  languages: ["Python", "Q#", "Julia"],
  timeLimit: "210 minutes"
}
],
      algorithm: [
  {
    title: "Bubble Sort",
    difficulty: "Beginner",
    description: "Implement the bubble sort algorithm for an array of numbers.",
    languages: ["Python", "JavaScript", "Java"],
    timeLimit: "30 minutes"
  },
  {
    title: "Binary Search",
    difficulty: "Intermediate",
    description: "Implement an iterative binary search algorithm on a sorted array.",
    languages: ["Python", "Java", "C"],
    timeLimit: "40 minutes"
  },
  {
    title: "Graph Traversal",
    difficulty: "Advanced",
    description: "Implement both BFS and DFS for a graph, with cycle detection.",
    languages: ["Python", "C++", "Java"],
    timeLimit: "120 minutes"
  },
  {
    title: "Quick Sort Implementation",
    difficulty: "Intermediate",
    description: "Develop an efficient quick sort algorithm with optimal pivot selection.",
    languages: ["C++", "Java", "Python"],
    timeLimit: "60 minutes"
  },
  {
    title: "Merge Sort Algorithm",
    difficulty: "Intermediate",
    description: "Implement a stable merge sort with recursive and iterative approaches.",
    languages: ["Python", "JavaScript", "Rust"],
    timeLimit: "50 minutes"
  },
  {
    title: "Dijkstra's Shortest Path",
    difficulty: "Advanced",
    description: "Implement Dijkstra's algorithm for finding shortest paths in a weighted graph.",
    languages: ["Java", "C++", "Python"],
    timeLimit: "90 minutes"
  },
  {
    title: "A* Pathfinding Algorithm",
    difficulty: "Advanced",
    description: "Create an A* pathfinding algorithm for grid-based movement.",
    languages: ["Python", "C++", "JavaScript"],
    timeLimit: "120 minutes"
  },
  {
    title: "Knapsack Problem Solver",
    difficulty: "Advanced",
    description: "Implement dynamic programming solution for 0/1 Knapsack problem.",
    languages: ["Python", "Java", "C++"],
    timeLimit: "80 minutes"
  },
  {
    title: "Longest Common Subsequence",
    difficulty: "Intermediate",
    description: "Create an algorithm to find the longest common subsequence between two strings.",
    languages: ["Python", "Java", "JavaScript"],
    timeLimit: "60 minutes"
  },
  {
    title: "Heap Sort Implementation",
    difficulty: "Intermediate",
    description: "Develop a heap sort algorithm with max and min heap variations.",
    languages: ["C++", "Java", "Python"],
    timeLimit: "55 minutes"
  },
  {
    title: "Topological Sort",
    difficulty: "Advanced",
    description: "Implement topological sorting for directed acyclic graphs.",
    languages: ["Python", "C++", "Java"],
    timeLimit: "70 minutes"
  },
  {
    title: "Minimum Spanning Tree",
    difficulty: "Advanced",
    description: "Implement Kruskal's or Prim's algorithm for minimum spanning tree.",
    languages: ["Java", "Python", "C++"],
    timeLimit: "90 minutes"
  },
  {
    title: "Dynamic Programming Coin Change",
    difficulty: "Advanced",
    description: "Solve the coin change problem using dynamic programming.",
    languages: ["Python", "Java", "JavaScript"],
    timeLimit: "75 minutes"
  },
  {
    title: "Red-Black Tree Implementation",
    difficulty: "Advanced",
    description: "Create a full Red-Black tree with insertion, deletion, and balancing.",
    languages: ["C++", "Java", "Python"],
    timeLimit: "120 minutes"
  },
  {
    title: "Rabin-Karp String Matching",
    difficulty: "Intermediate",
    description: "Implement the Rabin-Karp algorithm for efficient string pattern matching.",
    languages: ["Python", "C++", "Java"],
    timeLimit: "60 minutes"
  },
  {
    title: "Floyd-Warshall Algorithm",
    difficulty: "Advanced",
    description: "Implement all-pairs shortest path algorithm for weighted graphs.",
    languages: ["Python", "Java", "C++"],
    timeLimit: "90 minutes"
  },
  {
    title: "Trie Data Structure",
    difficulty: "Advanced",
    description: "Create a complete Trie data structure with insertion and search operations.",
    languages: ["C++", "Java", "Python"],
    timeLimit: "80 minutes"
  },
  {
    title: "Bellman-Ford Algorithm",
    difficulty: "Advanced",
    description: "Implement Bellman-Ford algorithm for shortest path with negative weights.",
    languages: ["Python", "Java", "C++"],
    timeLimit: "75 minutes"
  },
  {
    title: "Segment Tree Implementation",
    difficulty: "Advanced",
    description: "Develop a segment tree with range query and update operations.",
    languages: ["C++", "Java", "Python"],
    timeLimit: "100 minutes"
  },
  {
    title: "Huffman Coding Compression",
    difficulty: "Advanced",
    description: "Implement Huffman coding algorithm for data compression.",
    languages: ["Python", "C++", "Java"],
    timeLimit: "90 minutes"
  },
  {
    title: "Disjoint Set Union",
    difficulty: "Intermediate",
    description: "Implement Union-Find data structure with path compression.",
    languages: ["Python", "Java", "C++"],
    timeLimit: "60 minutes"
  },
  {
    title: "Longest Increasing Subsequence",
    difficulty: "Advanced",
    description: "Create an efficient algorithm to find the longest increasing subsequence.",
    languages: ["Python", "Java", "JavaScript"],
    timeLimit: "70 minutes"
  },
  {
    title: "Convex Hull Algorithm",
    difficulty: "Advanced",
    description: "Implement Graham's scan or Jarvis march algorithm for convex hull.",
    languages: ["C++", "Python", "Java"],
    timeLimit: "90 minutes"
  },
  {
    title: "String Edit Distance",
    difficulty: "Intermediate",
    description: "Create an algorithm to calculate Levenshtein distance between two strings.",
    languages: ["Python", "Java", "JavaScript"],
    timeLimit: "65 minutes"
  },
  {
    title: "Strongly Connected Components",
    difficulty: "Advanced",
    description: "Implement Kosaraju's algorithm for finding strongly connected components.",
    languages: ["Python", "C++", "Java"],
    timeLimit: "100 minutes"
  }
],
      design: [
  {
    title: "Business Card",
    difficulty: "Beginner",
    description: "Create a simple business card design using HTML and CSS.",
    skills: ["HTML", "CSS"],
    timeLimit: "30 minutes"
  },
  {
    title: "Responsive Dashboard",
    difficulty: "Intermediate",
    description: "Design a responsive admin dashboard with navigation and widgets.",
    skills: ["HTML", "CSS", "JavaScript"],
    timeLimit: "90 minutes"
  },
  {
    title: "E-Commerce Platform",
    difficulty: "Advanced",
    description: "Design a full e-commerce platform with cart functionality and responsive design.",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    timeLimit: "180 minutes"
  },
  {
    title: "Personal Portfolio Website",
    difficulty: "Beginner",
    description: "Create a responsive personal portfolio showcasing skills and projects.",
    skills: ["HTML", "CSS", "Responsive Design"],
    timeLimit: "45 minutes"
  },
  {
    title: "Mobile App Landing Page",
    difficulty: "Intermediate",
    description: "Design a responsive landing page for a mobile application with modern UI.",
    skills: ["HTML", "CSS", "JavaScript", "UI/UX Design"],
    timeLimit: "60 minutes"
  },
  {
    title: "Interactive Data Visualization Dashboard",
    difficulty: "Advanced",
    description: "Create a complex dashboard with interactive charts and real-time data updates.",
    skills: ["D3.js", "React", "CSS", "Data Visualization"],
    timeLimit: "180 minutes"
  },
  {
    title: "Social Media Profile Redesign",
    difficulty: "Intermediate",
    description: "Redesign a social media profile page with modern, clean interface.",
    skills: ["HTML", "CSS", "Figma", "UI Design"],
    timeLimit: "75 minutes"
  },
  {
    title: "Restaurant Reservation Web App",
    difficulty: "Advanced",
    description: "Design a comprehensive restaurant reservation system with user authentication.",
    skills: ["React", "Node.js", "CSS", "UX Design"],
    timeLimit: "240 minutes"
  },
  {
    title: "Travel Booking Platform",
    difficulty: "Advanced",
    description: "Create a full-featured travel booking website with responsive design.",
    skills: ["HTML", "CSS", "JavaScript", "React", "UI/UX"],
    timeLimit: "210 minutes"
  },
  {
    title: "Healthcare Appointment Booking Interface",
    difficulty: "Intermediate",
    description: "Design a user-friendly healthcare appointment booking system.",
    skills: ["HTML", "CSS", "JavaScript", "Accessibility Design"],
    timeLimit: "90 minutes"
  },
  {
    title: "Educational Platform Dashboard",
    difficulty: "Advanced",
    description: "Create a comprehensive dashboard for an online learning platform.",
    skills: ["React", "CSS", "UI/UX Design", "Responsive Design"],
    timeLimit: "180 minutes"
  },
  {
    title: "Cryptocurrency Trading Dashboard",
    difficulty: "Advanced",
    description: "Design a complex cryptocurrency trading interface with real-time updates.",
    skills: ["React", "WebSocket", "CSS", "Data Visualization"],
    timeLimit: "210 minutes"
  },
  {
    title: "Smart Home Control Interface",
    difficulty: "Intermediate",
    description: "Create a responsive and intuitive smart home control panel.",
    skills: ["HTML", "CSS", "JavaScript", "UI Design"],
    timeLimit: "75 minutes"
  },
  {
    title: "Fitness Tracking Mobile App UI",
    difficulty: "Intermediate",
    description: "Design a comprehensive fitness tracking mobile application interface.",
    skills: ["Figma", "UI/UX Design", "Responsive Design"],
    timeLimit: "120 minutes"
  },
  {
    title: "Event Management Platform",
    difficulty: "Advanced",
    description: "Create a full-featured event management and ticketing website.",
    skills: ["React", "Node.js", "CSS", "UX Design"],
    timeLimit: "240 minutes"
  },
  {
    title: "AI-Powered Job Search Platform",
    difficulty: "Advanced",
    description: "Design an innovative job search platform with AI-driven recommendations.",
    skills: ["React", "Machine Learning UI", "CSS", "UX Design"],
    timeLimit: "210 minutes"
  },
  {
    title: "Climate Change Awareness Dashboard",
    difficulty: "Intermediate",
    description: "Create an interactive dashboard visualizing climate change data.",
    skills: ["D3.js", "HTML", "CSS", "Data Visualization"],
    timeLimit: "120 minutes"
  },
  {
    title: "Freelance Marketplace Platform",
    difficulty: "Advanced",
    description: "Design a comprehensive freelance work marketplace with advanced features.",
    skills: ["React", "Node.js", "CSS", "Complex UI Design"],
    timeLimit: "240 minutes"
  },
  {
    title: "Virtual Reality Showcase Website",
    difficulty: "Advanced",
    description: "Create an immersive website showcasing virtual reality experiences.",
    skills: ["WebGL", "Three.js", "CSS", "Interactive Design"],
    timeLimit: "180 minutes"
  },
  {
    title: "Augmented Reality Product Viewer",
    difficulty: "Advanced",
    description: "Design an AR-enabled product visualization interface.",
    skills: ["WebAR", "JavaScript", "CSS", "Interactive Design"],
    timeLimit: "210 minutes"
  },
  {
    title: "Sustainable Living Community Platform",
    difficulty: "Advanced",
    description: "Design a comprehensive platform for sustainable living and eco-friendly community engagement.",
    skills: ["React", "UI/UX Design", "Accessibility", "Responsive Design"],
    timeLimit: "210 minutes"
  },
  {
    title: "Mental Health Tracking Application",
    difficulty: "Advanced",
    description: "Create a compassionate and intuitive mental health tracking and support application.",
    skills: ["Figma", "React", "Emotional Design", "Accessibility"],
    timeLimit: "180 minutes"
  },
  {
    title: "Interactive Museum Exhibit Design",
    difficulty: "Intermediate",
    description: "Design a digital interactive interface for a museum exhibit experience.",
    skills: ["HTML", "CSS", "JavaScript", "Interactive Design"],
    timeLimit: "120 minutes"
  },
  {
    title: "Multilingual Education Platform",
    difficulty: "Advanced",
    description: "Create a comprehensive language learning platform with adaptive UI.",
    skills: ["React", "Internationalization", "UX Design", "Accessibility"],
    timeLimit: "240 minutes"
  },
  {
    title: "Urban Planning Visualization Tool",
    difficulty: "Advanced",
    description: "Design an interactive urban planning and city development visualization platform.",
    skills: ["D3.js", "React", "Data Visualization", "Complex UI"],
    timeLimit: "210 minutes"
  },
  {
    title: "Inclusive Design Banking Application",
    difficulty: "Advanced",
    description: "Create a banking application with comprehensive accessibility features.",
    skills: ["UI/UX Design", "Accessibility", "React", "Inclusive Design"],
    timeLimit: "180 minutes"
  },
  {
    title: "Emergency Response Coordination Platform",
    difficulty: "Advanced",
    description: "Design a critical communication platform for emergency services.",
    skills: ["React", "Real-time UI", "Accessibility", "Complex Interactions"],
    timeLimit: "240 minutes"
  },
  {
    title: "Personalized Nutrition Tracking App",
    difficulty: "Intermediate",
    description: "Create a comprehensive nutrition and health tracking application.",
    skills: ["React", "Data Visualization", "UI/UX Design"],
    timeLimit: "150 minutes"
  },
  {
    title: "Renewable Energy Management Dashboard",
    difficulty: "Advanced",
    description: "Design an advanced dashboard for monitoring and managing renewable energy systems.",
    skills: ["D3.js", "React", "Complex Data Visualization", "Real-time UI"],
    timeLimit: "210 minutes"
  },
  {
    title: "Collaborative Urban Gardening Platform",
    difficulty: "Intermediate",
    description: "Create a community-driven urban gardening and local food sharing platform.",
    skills: ["React", "Community Design", "Interactive Maps"],
    timeLimit: "120 minutes"
  },
  {
    title: "Adaptive Learning Management System",
    difficulty: "Advanced",
    description: "Design an AI-powered adaptive learning platform with personalized learning paths.",
    skills: ["React", "Machine Learning UI", "Personalization", "Accessibility"],
    timeLimit: "240 minutes"
  },
  {
    title: "Immersive Storytelling Platform",
    difficulty: "Advanced",
    description: "Create an interactive platform for multimedia storytelling and content creation.",
    skills: ["WebGL", "React", "Interactive Narrative Design"],
    timeLimit: "210 minutes"
  },
  {
    title: "Elderly Care Support Application",
    difficulty: "Advanced",
    description: "Design a comprehensive support application for elderly care and communication.",
    skills: ["Accessibility", "React", "Inclusive Design", "Simple Interactions"],
    timeLimit: "180 minutes"
  },
  {
    title: "Climate Refugee Support Platform",
    difficulty: "Advanced",
    description: "Create a comprehensive platform for supporting and tracking climate refugees.",
    skills: ["React", "Humanitarian Design", "Complex Data Visualization"],
    timeLimit: "210 minutes"
  },
  {
    title: "Neurodiversity Workplace Support Tool",
    difficulty: "Advanced",
    description: "Design an inclusive workplace support application for neurodivergent individuals.",
    skills: ["Accessibility", "Inclusive Design", "React", "Complex Interactions"],
    timeLimit: "240 minutes"
  },
  {
    title: "Global Skill Exchange Platform",
    difficulty: "Advanced",
    description: "Create a comprehensive platform for global skill sharing and learning.",
    skills: ["React", "Internationalization", "Complex UI", "Community Design"],
    timeLimit: "210 minutes"
  },
  {
    title: "Disaster Preparedness Education Platform",
    difficulty: "Intermediate",
    description: "Design an interactive platform for community disaster preparedness education.",
    skills: ["React", "Interactive Design", "Educational UI"],
    timeLimit: "150 minutes"
  },
  {
    title: "Indigenous Knowledge Preservation Platform",
    difficulty: "Advanced",
    description: "Create a digital platform for preserving and sharing indigenous cultural knowledge.",
    skills: ["React", "Cultural Design", "Accessibility", "Multimedia UI"],
    timeLimit: "240 minutes"
  },
  {
    title: "Circular Economy Marketplace",
    difficulty: "Advanced",
    description: "Design a comprehensive marketplace promoting circular economy principles.",
    skills: ["React", "Sustainable Design", "Complex Marketplace UI"],
    timeLimit: "210 minutes"
  },
  {
    title: "Global Water Resource Management Dashboard",
    difficulty: "Advanced",
    description: "Create an advanced dashboard for tracking and managing global water resources.",
    skills: ["D3.js", "React", "Data Visualization", "Complex UI"],
    timeLimit: "240 minutes"
  },
  {
    title: "Quantum Computing Visualization Interface",
    difficulty: "Advanced",
    description: "Design an intuitive interface for visualizing and understanding quantum computing concepts.",
    skills: ["WebGL", "3D Visualization", "Complex UI", "Scientific Design"],
    timeLimit: "240 minutes"
  },
  {
    title: "Regenerative Agriculture Tracking Platform",
    difficulty: "Advanced",
    description: "Create a comprehensive platform for tracking and supporting regenerative agricultural practices.",
    skills: ["React", "Geospatial Visualization", "Sustainable Design", "Data Mapping"],
    timeLimit: "210 minutes"
  },
  {
    title: "Augmented Creativity Workspace",
    difficulty: "Advanced",
    description: "Design an AI-powered creative workspace that enhances human creativity across disciplines.",
    skills: ["AI Interface Design", "Generative UI", "Interaction Design", "Collaborative Tools"],
    timeLimit: "240 minutes"
  },
  {
    title: "Biodiversity Conservation Tracking System",
    difficulty: "Advanced",
    description: "Develop a comprehensive interface for tracking and supporting global biodiversity efforts.",
    skills: ["Data Visualization", "Ecological Design", "Interactive Mapping", "React"],
    timeLimit: "210 minutes"
  },
  {
    title: "Emotional Intelligence Learning Platform",
    difficulty: "Intermediate",
    description: "Create an interactive platform for developing emotional intelligence skills.",
    skills: ["Educational UI", "Interactive Design", "Psychological Visualization"],
    timeLimit: "150 minutes"
  },
  {
    title: "Distributed Autonomous Community Network",
    difficulty: "Advanced",
    description: "Design a decentralized platform for community resource sharing and mutual support.",
    skills: ["Blockchain UI", "Decentralized Design", "Community Interaction", "React"],
    timeLimit: "240 minutes"
  },
  {
    title: "Personalized Longevity Health Tracker",
    difficulty: "Advanced",
    description: "Create a comprehensive health tracking system focused on long-term wellness and prevention.",
    skills: ["Predictive UI", "Health Data Visualization", "Personalization", "Complex Interactions"],
    timeLimit: "210 minutes"
  },
  {
    title: "Artificial Ecosystem Simulation Interface",
    difficulty: "Advanced",
    description: "Design an immersive interface for simulating and understanding complex ecological systems.",
    skills: ["Scientific Visualization", "WebGL", "Ecological Modeling", "Interactive Design"],
    timeLimit: "240 minutes"
  },
  {
    title: "Global Cultural Exchange Platform",
    difficulty: "Advanced",
    description: "Create an immersive platform for deep cultural understanding and meaningful global connections.",
    skills: ["Intercultural Design", "Multimedia UI", "Language Interaction", "Empathy-Driven Design"],
    timeLimit: "210 minutes"
  },
  {
    title: "Cognitive Accessibility Design System",
    difficulty: "Advanced",
    description: "Develop a comprehensive design system for creating universally accessible digital experiences.",
    skills: ["Inclusive Design", "Accessibility", "Design Systems", "Neurodiversity-Informed UI"],
    timeLimit: "240 minutes"
  },
  {
    title: "Speculative Future Forecasting Tool",
    difficulty: "Advanced",
    description: "Design an interactive platform for exploring and visualizing potential future scenarios.",
    skills: ["Futurist Design", "Data Visualization", "Scenario Modeling", "Generative UI"],
    timeLimit: "210 minutes"
  },
  {
    title: "Collective Intelligence Amplification Platform",
    difficulty: "Advanced",
    description: "Create a sophisticated platform for enhancing collaborative problem-solving and innovation.",
    skills: ["Collaborative UI", "Complex Interaction Design", "Knowledge Mapping", "React"],
    timeLimit: "240 minutes"
  },
  {
    title: "Planetary Resilience Dashboard",
    difficulty: "Advanced",
    description: "Design a comprehensive dashboard tracking global environmental and social resilience indicators.",
    skills: ["Complex Data Visualization", "Systemic Design", "Global Indicator Tracking"],
    timeLimit: "210 minutes"
  },
  {
    title: "Synthetic Biology Design Interface",
    difficulty: "Advanced",
    description: "Create an intuitive interface for designing and visualizing synthetic biological systems.",
    skills: ["Scientific Visualization", "Biological Design", "Complex Interaction", "WebGL"],
    timeLimit: "240 minutes"
  },
  {
    title: "Interspecies Communication Platform",
    difficulty: "Advanced",
    description: "Design an experimental interface exploring communication possibilities between humans and other species.",
    skills: ["Speculative Design", "Interaction Modeling", "Empathy-Driven UI"],
    timeLimit: "210 minutes"
  },
  {
    title: "Minimalist Personal Budgeting App",
    difficulty: "Beginner",
    description: "Design a clean, user-friendly interface for personal budget tracking.",
    skills: ["HTML", "CSS", "Basic JavaScript", "UI Simplicity"],
    timeLimit: "45 minutes"
  },
  {
    title: "Local Community Event Finder",
    difficulty: "Intermediate",
    description: "Create an intuitive platform for discovering and sharing local community events.",
    skills: ["Responsive Design", "Interactive Maps", "Community UI"],
    timeLimit: "90 minutes"
  },
  {
    title: "Accessibility Color Palette Generator",
    difficulty: "Intermediate",
    description: "Design a tool that helps create color schemes accessible to people with color vision deficiencies.",
    skills: ["Color Theory", "Accessibility Design", "Interactive UI"],
    timeLimit: "75 minutes"
  },
  {
    title: "Plant Care Companion App",
    difficulty: "Beginner",
    description: "Design a simple app to help users track and care for their houseplants.",
    skills: ["Mobile UI Design", "Icon Design", "Basic Interaction"],
    timeLimit: "60 minutes"
  },
  {
    title: "Digital Time Capsule Platform",
    difficulty: "Advanced",
    description: "Create an innovative platform for preserving and sharing personal and collective memories.",
    skills: ["Emotional Design", "Multimedia UI", "Archival Interaction"],
    timeLimit: "210 minutes"
  },
  {
    title: "Neighborhood Skill Exchange Interface",
    difficulty: "Intermediate",
    description: "Design a community platform for local skill sharing and mutual learning.",
    skills: ["Community Design", "Interaction Flows", "Trust-Building UI"],
    timeLimit: "120 minutes"
  },
  {
    title: "Adaptive Learning Progress Visualizer",
    difficulty: "Advanced",
    description: "Create a dynamic interface that visualizes personal learning journey and growth.",
    skills: ["Data Visualization", "Personalization", "Motivational Design"],
    timeLimit: "180 minutes"
  },
  {
    title: "Micro-Volunteering Connection Hub",
    difficulty: "Intermediate",
    description: "Design a platform connecting volunteers with short-term, impactful community projects.",
    skills: ["Social Impact Design", "User Matching Interfaces", "Engagement UI"],
    timeLimit: "105 minutes"
  },
  {
    title: "Sensory-Friendly Public Space Finder",
    difficulty: "Advanced",
    description: "Develop an interface helping neurodivergent individuals find comfortable public spaces.",
    skills: ["Inclusive Design", "Detailed Filtering", "Empathy-Driven UI"],
    timeLimit: "240 minutes"
  },
  {
    title: "Personal Carbon Footprint Tracker",
    difficulty: "Intermediate",
    description: "Create an engaging interface for tracking and reducing personal environmental impact.",
    skills: ["Data Visualization", "Motivational Design", "Sustainability UI"],
    timeLimit: "90 minutes"
  },
  {
    title: "Intergenerational Knowledge Exchange",
    difficulty: "Advanced",
    description: "Design a platform facilitating meaningful knowledge sharing across different age groups.",
    skills: ["Inclusive Design", "Multimedia Interaction", "Storytelling UI"],
    timeLimit: "210 minutes"
  },
  {
    title: "Local Food Ecosystem Mapper",
    difficulty: "Intermediate",
    description: "Create an interface connecting local food producers, consumers, and community resources.",
    skills: ["Geospatial Design", "Community Networking", "Interactive Mapping"],
    timeLimit: "120 minutes"
  },
  {
    title: "Mental Wellness Habit Builder",
    difficulty: "Intermediate",
    description: "Design a compassionate and motivational app for developing positive mental health habits.",
    skills: ["Behavioral Design", "Gentle Motivation", "Progress Tracking"],
    timeLimit: "105 minutes"
  },
  {
    title: "Inclusive Playground Design Tool",
    difficulty: "Advanced",
    description: "Create an interactive platform for designing universally accessible play spaces.",
    skills: ["Accessibility Design", "3D Visualization", "Inclusive Interaction"],
    timeLimit: "240 minutes"
  },
  {
    title: "Community Resilience Network",
    difficulty: "Advanced",
    description: "Design a comprehensive platform for local community preparedness and mutual support.",
    skills: ["Complex System Design", "Resource Mapping", "Collaborative UI"],
    timeLimit: "210 minutes"
  },
  {
    title: "Personal Memory Preservation Interface",
    difficulty: "Intermediate",
    description: "Create an intuitive platform for organizing, protecting, and sharing personal memories.",
    skills: ["Emotional Design", "Privacy-Focused UI", "Multimedia Management"],
    timeLimit: "120 minutes"
  },
  {
    title: "Sustainable Fashion Recommender",
    difficulty: "Advanced",
    description: "Design an ethical fashion recommendation platform focusing on sustainability and personal style.",
    skills: ["Personalization", "Ethical Design", "Complex Recommendation Systems"],
    timeLimit: "180 minutes"
  },
  {
    title: "Local Biodiversity Citizen Science App",
    difficulty: "Intermediate",
    description: "Create an engaging app for community-driven local ecosystem monitoring.",
    skills: ["Scientific UI", "Citizen Science Design", "Data Collection Interfaces"],
    timeLimit: "105 minutes"
  },
  {
    title: "Collaborative Urban Redesign Platform",
    difficulty: "Advanced",
    description: "Design a comprehensive platform for community-driven urban space reimagination.",
    skills: ["Participatory Design", "Urban Planning UI", "Collaborative Visualization"],
    timeLimit: "240 minutes"
  },
  {
    title: "Empathy Training Simulation",
    difficulty: "Advanced",
    description: "Create an immersive interface for developing cross-cultural understanding and empathy.",
    skills: ["Narrative Design", "Interactive Storytelling", "Perspective-Shifting UI"],
    timeLimit: "210 minutes"
  }
]
    };

    this.difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
    this.categories = Object.keys(this.challenges);
  }

  async generateCoverImage(challenge) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const drawDynamicBadge = (difficulty) => {
    const difficultyColors = {
      'Beginner': '#22c55e',
      'Intermediate': '#eab308',
      'Advanced': '#ef4444',
      'default': '#6b7280'
    };

    ctx.font = '600 14px Inter';
    
    const textMetrics = ctx.measureText(difficulty);
    const textWidth = textMetrics.width;
    
    const horizontalPadding = 20;
    const verticalPadding = 10;
    const minWidth = 100;
    const cornerRadius = 15;
    
    const badgeWidth = Math.max(textWidth + (2 * horizontalPadding), minWidth);
    const badgeHeight = 30;
    const badgeX = 40;
    const badgeY = 40;

    const badgeColor = difficultyColors[difficulty] || difficultyColors.default;
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, cornerRadius);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 14px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(difficulty, badgeX + (badgeWidth / 2), badgeY + (badgeHeight / 2));

    return { 
      width: badgeWidth, 
      height: badgeHeight,
      x: badgeX,
      y: badgeY
    };
  };

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#111827');
  gradient.addColorStop(1, '#1f2937');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.1;
  const cols = 12;
  const rows = 4;
  const dotSize = 8;
  const gapX = width / cols;
  const gapY = height / rows;
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      ctx.beginPath();
      ctx.arc(gapX * i + gapX/2, gapY * j + gapY/2, dotSize/2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }
  ctx.restore();

  const badge = drawDynamicBadge(challenge.difficulty);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Inter';
  ctx.fillText(
    challenge.category.toUpperCase(), 
    badge.x + badge.width + 20,
    60
  );

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px Inter';
  ctx.textAlign = 'center';
  const titleLines = this.wrapText(ctx, challenge.title, width - 160, 48);
  let titleY = height / 2 - (titleLines.length * 54 / 2);
  titleLines.forEach(line => {
    ctx.fillText(line, width / 2, titleY);
    titleY += 54;
  });

  ctx.fillStyle = '#d1d5db';
  ctx.font = '25px Inter';
  ctx.textAlign = 'center';
  const descLines = this.wrapText(ctx, challenge.description, width - 160, 24);
  let descY = titleY + 40;
  descLines.slice(0, 2).forEach(line => {
    ctx.fillText(line, width / 2, descY);
    descY += 30;
  });

ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(40 + 16, height - 40, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '17px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('✦', 40 + 16, height - 38);


  ctx.textAlign = 'left';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px Inter';
  ctx.fillText('Challenge', 40 + 40, height - 34);

  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Inter';
  ctx.textAlign = 'right';
  ctx.fillText('Generated by Lumina', width - 40, height - 34);

  return canvas.toBuffer('image/png');
}

  wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  getUsageInstructions() {
    return `
📚 <b>Challenge Guide</b> 📚

1️⃣ <b>Category-Specific Challenge:</b>
   /challenge [category]
   • Example: <code>/challenge coding</code>
   • Example: <code>/challenge algorithm</code>
   • Example: <code>/challenge design</code>

2️⃣ <b>Difficulty-Specific Challenge:</b>
   /challenge [difficulty]
   • Example: <code>/challenge Beginner</code>
   • Example: <code>/challenge Intermediate</code>
   • Example: <code>/challenge Advanced</code>

3️⃣ <b>Category and Difficulty:</b>
   /challenge [category] [difficulty]
   • Example: <code>/challenge coding Beginner</code>
   • Example: <code>/challenge algorithm Advanced</code>

<b>Available Categories:</b> ${this.categories.join(', ')}
<b>Difficulty Levels:</b> ${this.difficultyLevels.join(', ')}`;
  }

  generateChallenge(category = null, difficulty = null) {
    try {
      if (category && !this.categories.includes(category)) {
        throw new Error(`Invalid category! Available categories are: ${this.categories.join(', ')}`);
      }

      if (difficulty && !this.difficultyLevels.includes(difficulty)) {
        throw new Error(`Invalid difficulty! Available levels are: ${this.difficultyLevels.join(', ')}`);
      }

      const selectedCategory = category || 
        this.categories[crypto.randomInt(0, this.categories.length)];

      let challengeList = this.challenges[selectedCategory];

      if (difficulty) {
        challengeList = challengeList.filter(c => c.difficulty === difficulty);
        if (challengeList.length === 0) {
          throw new Error(`No challenges found for ${difficulty} difficulty in ${selectedCategory} category!`);
        }
      }

      const challenge = challengeList[crypto.randomInt(0, challengeList.length)];

      return {
        category: selectedCategory,
        ...challenge,
        id: this.generateChallengeId()
      };
    } catch (error) {
      throw error;
    }
  }

  generateChallengeId() {
    return crypto.randomBytes(8).toString('hex');
  }

  formatChallengeMessage(challenge) {
    return `
🎯 CHALLENGE

🌟 Title: ${challenge.title}
🏷️ Category: ${challenge.category.toUpperCase()}
📊 Difficulty: ${challenge.difficulty}

📝 Description:
${challenge.description}

⏱️ Time Limit: ${challenge.timeLimit}

${challenge.languages ? 
  `💻 Recommended Languages: ${challenge.languages.join(', ')}` : 
  `🎨 Required Skills: ${challenge.skills?.join(', ')}`}

🆔 Challenge ID: <code>${challenge.id}</code>

💡 Tip: Break down the problem into smaller steps and test your solution thoroughly!`;
  }
}

const registerFonts = () => {
  const fontsDir = path.join(__dirname, 'fonts');
  if (fs.existsSync(fontsDir)) {
    registerFont(path.join(fontsDir, 'Inter-Regular.ttf'), { family: 'Inter' });
    registerFont(path.join(fontsDir, 'Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' });
    registerFont(path.join(fontsDir, 'Inter-SemiBold.ttf'), { family: 'Inter', weight: '600' });
  }
};

module.exports = {
  name: 'challenge',
  description: 'Generate coding, algorithm, and design challenges',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const challengeGenerator = new ChallengeGenerator();

    try {
      await bot.sendChatAction(chatId, 'upload_photo');

      registerFonts();

      if (args.length === 0) {
        await bot.sendMessage(chatId, challengeGenerator.getUsageInstructions(), {
          parse_mode: 'HTML'
        });
        return;
      }

      let category = null;
      let difficulty = null;

      if (args.length > 0) {
        if (challengeGenerator.difficultyLevels.includes(args[0])) {
          difficulty = args[0];
          if (args[1]) category = args[1].toLowerCase();
        } else {
          category = args[0].toLowerCase();
          if (args[1] && challengeGenerator.difficultyLevels.includes(args[1])) {
            difficulty = args[1];
          }
        }
      }

      const challenge = challengeGenerator.generateChallenge(category, difficulty);
      const challengeMessage = challengeGenerator.formatChallengeMessage(challenge);
      
      const coverImage = await challengeGenerator.generateCoverImage(challenge);

      await bot.sendPhoto(chatId, coverImage, {
        caption: challengeMessage,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Challenge Generation Error:', error);
      const errorMessage = `⚠️ Error: ${error.message}\n\n${challengeGenerator.getUsageInstructions()}`;
      
      await bot.sendMessage(chatId, errorMessage, {
        parse_mode: 'HTML'
      });
    }
  }
};
