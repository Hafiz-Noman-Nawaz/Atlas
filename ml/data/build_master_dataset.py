"""
Master Dataset Generator with Anti-Overfitting & Deep Knowledge Augmentation for Atlas Chatbot.
Generates >26,000 diverse, balanced training samples across 32 distinct intents.
Includes real code fragments, natural linguistic preambles, suffixes, typo variations, and edge cases.
"""

import os
import random
import pandas as pd

INTENT_TEMPLATES = {
    # 1. Chat Management & App Operations
    "chat_management": [
        "can I change the name of this chat?",
        "can I rename this chat?",
        "how to change the title of this conversation?",
        "how to rename a chat?",
        "how do I rename this conversation?",
        "rename this chat",
        "change chat name",
        "can I edit the title of this chat?",
        "how can I rename my conversation?",
        "how to delete this chat?",
        "can I delete this conversation?",
        "how do I remove a chat?",
        "how to delete all my chats?",
        "how to clear conversation history?",
        "can I export this chat?",
        "how to export conversation as markdown?",
        "how to download chat as JSON?",
        "how do I save or export this conversation?",
        "how to start a new chat?",
        "how to create a new conversation?",
        "how to search through old chats?",
        "where can I see my previous chats?",
        "how to switch between conversations in sidebar?",
        "is it possible to export chat as json or md file?",
        "how to delete a single conversation?",
        "how to wipe my conversation history?",
        "how do I pin a chat to the top?",
        "can I star or pin important conversations?",
        "how to unpin a conversation in the sidebar?",
        "how to search conversation history with keyword?",
        "where is the search bar for past chats?",
    ],

    # 2. Capabilities & Limitations
    "capabilities": [
        "what can you do and what can't you do?",
        "what can you do?",
        "what can't you do?",
        "what are your capabilities and limitations?",
        "what are your features?",
        "what tasks can you perform?",
        "what are your limitations?",
        "what topics can you help me with?",
        "show me your capabilities",
        "tell me what you are capable of",
        "what are you not allowed to do?",
        "can you execute code on my local machine?",
        "can you browse the live internet?",
        "can you access my private local files directly without upload?",
        "can you make phone calls or send sms?",
        "what can Atlas do?",
        "list your abilities",
        "what are you able to do?",
        "what are you unable to do?",
        "tell me the limits of this AI chatbot",
        "can you connect to physical devices?",
        "explain your scope of assistance",
        "what domains do you excel at?",
        "give me a breakdown of what you support",
    ],

    # 3. Unsupported Out-of-Scope Requests
    "unsupported_tasks": [
        "can you cook food for me?",
        "can you fly an airplane?",
        "can you call my phone number?",
        "can you transfer money from my bank account?",
        "can you fix my physical broken laptop screen?",
        "can you order pizza for me?",
        "can you clean my bedroom?",
        "can you drive my car?",
        "can you buy groceries for me?",
        "can you physically wash dishes?",
        "can you do my laundry?",
        "can you turn on the physical lights in my house?",
        "can you hack into someone's private email?",
        "can you predict future lottery numbers?",
        "can you make a reservation at a restaurant for tonight?",
        "can you book a flight ticket for me?",
        "can you assemble physical furniture?",
        "can you perform surgery?",
        "can you access my bank account?",
        "can you physically repair my car engine?",
        "can you buy medicine from the pharmacy for me?",
        "can you call the police for me?",
        "can you wire money through Western Union?",
    ],

    # 4. App Settings & User Interface Features
    "app_features": [
        "how do I upload an image or screenshot?",
        "can I paste screenshots with Ctrl+V?",
        "how to attach a file to my message?",
        "how to change my nickname in settings?",
        "how to change profile picture in settings?",
        "how to switch between dark mode and light mode?",
        "how to change font size in settings?",
        "how to adjust AI temperature and creativity?",
        "how do I delete my account?",
        "where are the settings located?",
        "how to copy code snippets from responses?",
        "is there a copy button on code blocks?",
        "how to change theme in atlas chatbot?",
        "how to access account danger zone in settings?",
        "how to upload my avatar picture?",
        "can I adjust system prompt or temperature?",
        "how to use voice input microphone?",
        "can I dictate my message with speech to text?",
        "how to listen to responses with text to speech audio?",
        "how does the live code runner sandbox work?",
        "how to run code directly inside the chat window?",
        "how to upload PDF or DOCX documents for QA?",
    ],

    # 5. User Name Declaration (Memory)
    "user_name_declare": [
        "My name is {name}",
        "I am {name}",
        "I'm {name}",
        "Call me {name}",
        "You can call me {name}",
        "The name is {name}",
        "My full name is {name}",
        "Everyone calls me {name}",
        "Hey, my name is {name}",
        "Hi Atlas, I am {name}",
        "Please remember that my name is {name}",
        "My nickname is {name}",
        "I go by the name {name}",
        "Hello, this is {name}",
        "It's {name}",
        "Let me introduce myself, I am {name}",
        "Save my name as {name}",
        "Remember me as {name}",
        "My name is {name} nice to meet you",
        "You can refer to me as {name}",
        "Set my display name to {name}",
        "From now on call me {name}",
        "Mera naam {name} hai",
        "I want you to know my name is {name}",
        "My name is {name}, please store it",
    ],

    # 6. User Name Query (Memory Recall)
    "user_name_query": [
        "What is my name?",
        "What's my name?",
        "Do you remember my name?",
        "Do you know my name?",
        "Tell me my name",
        "Who am I?",
        "Do you know who I am?",
        "Can you tell me what my name is?",
        "What name did I tell you?",
        "What is my nickname?",
        "Say my name",
        "Do you recall who is talking to you?",
        "Check what my name is",
        "Remind me of my name",
        "Who is chatting with you right now?",
        "What is the name of the user?",
        "Do you have my name in your database?",
        "What name do you have saved for me?",
        "Mera naam kya hai?",
        "What did I say my name was?",
    ],

    # 7. Bot Identity
    "bot_identity": [
        "What is your name?",
        "What's your name?",
        "Who are you?",
        "What are you called?",
        "What should I call you?",
        "Tell me your name",
        "What is this bot's name?",
        "Are you Atlas?",
        "Introduce yourself",
        "Give me your introduction",
        "Tell me about yourself",
        "Who is this assistant?",
        "Are you an AI chatbot?",
        "What is your identity?",
        "Who am I speaking to?",
        "State your name and purpose",
        "What is the identity of this assistant?",
        "What model or platform is this?",
    ],

    # 8. Age
    "age": [
        "How old are you?",
        "What is your age?",
        "When were you born?",
        "What's your birthdate?",
        "How long have you existed?",
        "When was your creation date?",
        "What is your launch year?",
        "Are you new or old?",
        "What is your release date?",
    ],

    # 9. Creator
    "creator": [
        "Who created you?",
        "Who made you?",
        "Who is your creator?",
        "Who built Atlas?",
        "Who is your developer?",
        "Who programmed this bot?",
        "Who is your author?",
        "Who designed the Atlas chatbot?",
        "Who engineered your backend?",
        "Which team built this platform?",
    ],

    # 10. Greeting
    "greeting": [
        "Hi",
        "Hello",
        "Hey there",
        "Good morning",
        "Good afternoon",
        "Good evening",
        "Hi Atlas",
        "Hey buddy",
        "Greetings",
        "Howdy",
        "What's up?",
        "Yo",
        "Hello assistant",
        "Hi there!",
        "Hey",
        "Hiya",
        "Salutations",
        "Hey yo",
        "As-salamu alaykum",
        "Namaste",
        "Hola",
    ],

    # 11. Goodbye
    "goodbye": [
        "Goodbye",
        "Bye",
        "See you later",
        "Talk to you later",
        "Catch you later",
        "Have a good day",
        "Good night",
        "Signing off",
        "Farewell",
        "See ya",
        "Take care",
        "Bye bye",
        "I gotta go",
        "Ending chat now",
        "See you soon",
        "Have a great evening",
    ],

    # 12. Thanks
    "thanks": [
        "Thanks",
        "Thank you",
        "Thanks a lot",
        "Thank you so much",
        "Much appreciated",
        "Thanks for the help",
        "I appreciate your assistance",
        "Awesome, thanks!",
        "Thanks for explaining",
        "Hearty thanks",
        "Thank you very much",
        "Thanks for the quick response",
        "You helped me a lot thanks",
        "Shukriya",
        "Thanks a million",
        "Appreciate the clear solution",
    ],

    # 13. How Are You
    "how_are_you": [
        "How are you?",
        "How are you doing today?",
        "How's it going?",
        "How do you feel?",
        "Are you doing well?",
        "How is everything?",
        "How have you been?",
        "How's your day?",
        "Everything running smooth with you?",
        "How is your health?",
        "How are things on your end?",
    ],

    # 14. Help
    "help": [
        "I need help",
        "Can you help me?",
        "Help please",
        "Could you give me some assistance?",
        "I'm stuck, need help",
        "Need guidance on a problem",
        "Assist me please",
        "Can you assist me with something?",
        "I need some support on my task",
        "Help me out with a quick problem",
    ],

    # 15. JavaScript & Frontend Programming
    "javascript": [
        "Explain JavaScript promises and async/await syntax",
        "What is the JavaScript event loop and call stack?",
        "Explain closures in JavaScript with a practical example",
        "What is the difference between var, let, and const in JS?",
        "How does prototypal inheritance work in JavaScript?",
        "Explain Array methods: map, filter, reduce, forEach",
        "What is destructuring assignment and spread operator in ES6?",
        "Explain the this keyword binding in JavaScript",
        "What is debouncing and throttling in JavaScript?",
        "write a javascript code which uses event listener to change the color of the box",
        "write a jawascript code which uses event listener to change the color of the box",
        "write a js code to add an event listener to a button",
        "how to change background color on click in javascript",
        "how to toggle a class on click in js",
        "create a simple counter in javascript with addEventListener",
        "how to select an element by id in javascript and change its style",
        "write javascript function to fetch data from an api",
        "how does document.querySelector work in javascript?",
        "how to handle form submit event in javascript without page reload",
        "write a javascript script to animate a div on click",
        "create an event listener for mouseover and mouseout in js",
        "how to attach click event in javascript",
        "write jawascript program to manipulate the DOM",
        "write javascript to change text content of paragraph",
        "how to create an element in javascript using document.createElement",
        "javascript code to validate email address using regex",
        "how to store data in localStorage in javascript",
        "how to create a modal popup in vanilla javascript",
        "how to use settimeout and setinterval in js",
        "explain callback functions in javascript",
        "const element = document.getElementById('box'); element.addEventListener('click', () => {});",
        "function fetchData() { return fetch('/api').then(res => res.json()); }",
        "how to use Promise.allSettled vs Promise.all in modern ES6?",
        "explain TypeScript interfaces vs type aliases with union types",
        "how to deep clone an object in modern JavaScript using structuredClone?",
    ],

    # 16. Python Programming
    "python": [
        "Explain Python decorators with a code example",
        "What are Python list comprehensions and generator expressions?",
        "Explain the difference between *args and **kwargs in Python",
        "How does Python memory management and garbage collection work?",
        "What is the difference between shallow copy and deep copy in Python?",
        "Explain Python async/await and asyncio event loop",
        "What are Python dunder magic methods like __init__?",
        "How to use lambda functions and map/filter in Python?",
        "Explain Python virtual environments venv and pip",
        "write a python program using for loop and print prime numbers",
        "write a python code for prime numbers",
        "write a python script to read and write a csv file",
        "how to handle exceptions with try except in python",
        "write a python function to check if a string is palindrome",
        "how to make http requests with python requests library",
        "explain python generators and the yield keyword",
        "how to sort a dictionary by value in python",
        "write a python program to calculate factorial using recursion",
        "how to use list comprehension in python with if condition",
        "write pythn code to reverse a list",
        "how to open and read a text file in python with with statement",
        "explain python classes, inheritance and super method",
        "def is_prime(n): return all(n % i != 0 for i in range(2, int(n**0.5) + 1)) if n > 1 else False",
        "with open('dataset.csv', 'r', encoding='utf-8') as f: reader = csv.reader(f)",
        "how to use dataclasses in Python 3.10+?",
        "explain context managers and the __enter__ and __exit__ methods in Python",
        "how to use multiprocessing vs threading in Python for CPU-bound tasks?",
    ],

    # 17. Code Debugging
    "code_debugging": [
        "Why is my code throwing TypeError: cannot read property of undefined?",
        "Fix this IndexError: list index out of range",
        "Why am I getting undefined is not a function in JavaScript?",
        "How to fix NullPointerException in my application?",
        "My code crashes with RecursionError: maximum depth exceeded",
        "Help me debug this memory leak in Node.js",
        "Why is my async await function returning a pending Promise?",
        "How to resolve SyntaxError: unexpected token in JSON?",
        "Why does my for loop run indefinitely?",
        "Fix this segmentation fault error",
        "How to troubleshoot 500 Internal Server Error in Express?",
        "Why is my React useEffect running in an infinite loop?",
        "How to fix CORS policy error in Node.js backend?",
        "Why does my Python dictionary raise KeyError?",
        "Debug why my state is not updating in React",
        "Why is my array map returning undefined?",
        "How to fix ReferenceError variable is not defined?",
        "Why is my API returning 404 Not Found error?",
        "Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')",
        "Error: EADDRINUSE: address already in use :::8000",
        "SyntaxError: await is only valid in async functions and at top level",
        "ValueError: invalid literal for int() with base 10",
        "MongooseError: Operation `users.findOne()` buffering timed out after 10000ms",
    ],

    # 18. Database & SQL
    "database_sql": [
        "Write a SQL query using INNER JOIN between two tables",
        "How to create an index in MongoDB?",
        "Explain the difference between SQL and NoSQL databases",
        "Write a PostgreSQL query with GROUP BY and HAVING clauses",
        "What is the MongoDB aggregation pipeline?",
        "Explain ACID transactions in relational databases",
        "How to optimize slow database queries using indexes?",
        "What is foreign key constraint in MySQL?",
        "Explain database normalization from 1NF to 3NF",
        "How to perform pagination in MongoDB using skip and limit?",
        "Explain Redis caching and in-memory key-value store",
        "How to prevent SQL injection in backend APIs?",
        "Write a SQL query to find duplicate records in a table",
        "How does database sharding and replication work?",
        "How to create a MongoDB replica set and connection string?",
        "Explain SQL triggers and stored procedures",
        "SELECT u.id, u.email, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id",
        "db.conversations.createIndex({ userId: 1, isPinned: -1, updatedAt: -1 })",
        "explain B-tree indexes vs Hash indexes in relational databases",
        "how to write a window function ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) in SQL",
    ],

    # 19. Git & DevOps
    "git_devops": [
        "How do I undo the last commit in Git?",
        "How to resolve a git merge conflict step by step?",
        "Explain git rebase vs git merge",
        "What is a Docker container vs a virtual machine?",
        "Write a Dockerfile for a Node.js Express application",
        "What is docker-compose and how do I use it?",
        "How to stash changes in Git?",
        "Explain CI/CD pipeline with GitHub Actions",
        "What is Kubernetes pod and deployment?",
        "How to check git commit history?",
        "How to push changes to a new git branch?",
        "How to discard all uncommitted changes in git?",
        "Explain Nginx reverse proxy configuration",
        "git reset --soft HEAD~1",
        "git rebase -i origin/main",
        "FROM node:20-alpine WORKDIR /app COPY package*.json ./ RUN npm install COPY . . EXPOSE 8000 CMD ['node', 'src/server.js']",
        "how to configure multi-stage Docker builds to reduce image size?",
        "how to set up SSL certificates with Certbot and Let's Encrypt in Nginx?",
    ],

    # 20. Algorithms & Data Structures
    "algorithms": [
        "Explain binary search algorithm and its O(log n) time complexity",
        "What is the difference between BFS and DFS traversal?",
        "Explain Dijkstra shortest path algorithm in graph theory",
        "What is Dynamic Programming and memoization?",
        "Explain Big O notation with examples (O(1), O(n), O(n^2), O(log n))",
        "How does Quicksort algorithm work and what is its average complexity?",
        "Explain two pointers technique in array problems",
        "Write an efficient algorithm to find the longest substring without repeating characters",
        "How to implement LRU cache in JavaScript or Python?",
        "Explain divide and conquer algorithms with Merge Sort",
        "How to detect a cycle in a linked list using Floyd algorithm?",
        "Explain Trie data structure for autocomplete prefix search",
        "how to find the median of two sorted arrays in logarithmic time?",
        "explain topological sort using Kahn's algorithm with indegrees",
        "how to solve 0/1 Knapsack problem with dynamic programming table?",
    ],

    # 21. System Design & Architecture
    "system_design": [
        "How to design a URL shortener like Bitly?",
        "Explain microservices architecture vs monolithic architecture",
        "How does a Load Balancer work (Round Robin, Least Connections)?",
        "What is horizontal scaling vs vertical scaling?",
        "Explain caching strategies: Cache-Aside, Write-Through",
        "What is the CAP theorem in distributed systems?",
        "How to design a real-time notification system with WebSockets?",
        "Explain message queues like Kafka and RabbitMQ",
        "How to design rate limiting algorithm with Token Bucket?",
        "how to design a distributed unique ID generator like Twitter Snowflake?",
        "how to handle eventual consistency in microservices with Saga pattern?",
        "explain database sharding strategies and consistent hashing",
    ],

    # 22. Cybersecurity
    "cybersecurity": [
        "What is Cross-Site Scripting (XSS) and how to prevent it?",
        "What is SQL injection (SQLi) and how to prevent it?",
        "How does JWT (JSON Web Token) authentication and verification work?",
        "Explain Cross-Site Request Forgery (CSRF) protection",
        "What is bcrypt password hashing with salt?",
        "How does HTTPS and SSL/TLS encryption handshake work?",
        "What is OAuth 2.0 authorization framework and flow?",
        "How to securely store API keys and environment variables?",
        "how to prevent DDoS attacks using Cloudflare and rate limiting?",
        "explain Content Security Policy (CSP) headers and how to configure them",
        "what is the difference between symmetric and asymmetric encryption RSA vs AES?",
    ],

    # 23. Machine Learning
    "machine_learning": [
        "What is machine learning and what are its core paradigms?",
        "Explain gradient descent optimization and learning rate",
        "What is the difference between supervised and unsupervised learning?",
        "Explain overfitting vs underfitting and regularization L1/L2",
        "What is cross-validation and k-fold validation?",
        "Explain Precision, Recall, F1 Score, and ROC-AUC curve",
        "How does Random Forest classifier work?",
        "Explain Support Vector Machines SVM",
        "How does backpropagation work in neural networks?",
        "Explain Transformer architecture and self-attention mechanism",
        "What is TF-IDF and how does text vectorization work?",
        "how does CalibratedClassifierCV compute probability estimates for LinearSVC?",
        "explain word embeddings Word2Vec vs BERT vs subword tokenization",
        "what is learning rate decay and Adam optimizer with momentum?",
    ],

    # 24. Data Science
    "data_science": [
        "How to use Pandas for data cleaning, filtering, and aggregation?",
        "What is exploratory data analysis EDA in data science?",
        "How to handle missing data and outliers in tabular datasets?",
        "Explain NumPy vectorized operations and array broadcasting",
        "How to create data visualizations with Matplotlib and Seaborn?",
        "What is feature engineering and feature scaling StandardScaler?",
        "Explain correlation vs causation with Pearson correlation",
        "What is A/B testing and hypothesis testing?",
        "How to group data by column and compute mean in Pandas?",
        "df.groupby('category').agg({'price': ['mean', 'median', 'count']})",
        "how to remove collinear features using Variance Inflation Factor (VIF)?",
    ],

    # 25. Web Development
    "web_development": [
        "Explain React hooks: useState, useEffect, useMemo, useCallback",
        "What is Client-Side Rendering CSR vs Server-Side Rendering SSR?",
        "How does Tailwind CSS utility-first framework work?",
        "Explain state management in React with Zustand or Redux",
        "What is RESTful API design and HTTP status codes?",
        "How does Next.js App Router and Server Components work?",
        "Explain CSS Flexbox vs CSS Grid layouts",
        "How to optimize web performance and Core Web Vitals?",
        "Explain browser cookies vs localStorage vs sessionStorage",
        "how to implement infinite scrolling with IntersectionObserver in React?",
        "how to prevent unnecessary re-renders in React using React.memo and useMemo?",
    ],

    # 26. Programming General
    "programming": [
        "What is Object-Oriented Programming OOP and its 4 pillars?",
        "Explain SOLID principles of software design with examples",
        "What is the difference between compiled and interpreted languages?",
        "Explain recursion and base case conditions in functions",
        "What is the difference between stack and heap memory?",
        "Explain Design Patterns: Singleton, Factory, Observer",
        "What is clean code and refactoring best practices?",
        "Explain DRY (Don't Repeat Yourself) principle",
        "how does garbage collection work in V8 engine and JVM?",
        "explain functional programming concepts: pure functions, immutability, currying",
    ],

    # 27. Jokes
    "jokes": [
        "Tell me a joke",
        "Make me laugh",
        "Do you know any programming jokes?",
        "Tell me a funny computer science joke",
        "Got any good developer jokes?",
        "Say something funny",
        "Tell me a joke about software engineers",
        "Why do programmers prefer dark mode?",
        "Tell me a funny joke about JavaScript bugs",
    ],

    # 28. Motivation
    "motivation": [
        "Give me some motivation",
        "I feel unmotivated to code",
        "Inspire me to study and build projects",
        "Share an inspirational quote about programming",
        "How to stay consistent with coding every day?",
        "Encourage me to keep learning technology",
        "I feel overwhelmed with coding",
        "I have imposter syndrome, give me encouragement",
        "How to overcome burnout when building large applications?",
    ],

    # 29. Study Help
    "study_help": [
        "How should I study computer science effectively?",
        "Give me a roadmap to learn machine learning",
        "How to prepare for coding interviews LeetCode?",
        "What is the best way to learn web development from scratch?",
        "Tips for building a strong developer portfolio",
        "How to practice data structures efficiently?",
        "How to study for system design interviews?",
        "What are the best free resources to learn full stack development?",
    ],

    # 30. Weather
    "weather": [
        "What's the weather like?",
        "Is it going to rain today?",
        "What is the temperature outside?",
        "How is the weather forecast?",
        "Do I need an umbrella today?",
        "What is the climate like right now?",
        "Is it sunny or cloudy outside?",
    ],

    # 31. Time
    "time": [
        "What time is it?",
        "What is the current time?",
        "What is today's date?",
        "Tell me the current time and day",
        "What day of the week is it?",
        "What year and month is it?",
    ],

    # 32. Contact
    "contact": [
        "How can I contact support?",
        "Where can I reach out for help?",
        "What is the contact email?",
        "How to get in touch with the creator?",
        "Where can I report a bug?",
        "How can I submit feature requests?",
    ],

    # 33. Feedback
    "positive_feedback": [
        "You are great!",
        "Awesome job Atlas",
        "This explanation was super helpful",
        "I love this chatbot",
        "Fantastic response",
        "You nailed this answer",
        "Super helpful explanation",
        "This solved my problem completely!",
        "Great answer thank you",
    ],
    "negative_feedback": [
        "That didn't help",
        "This is incorrect",
        "Your answer is wrong",
        "I'm not happy with this response",
        "That's not what I asked for",
        "Bad response",
        "This response is not working",
        "Your code snippet threw an error",
        "This does not answer my question",
    ],

    # 34. Summarization, Formatting & Brevity Follow-up
    "summarize_simplify": [
        "describe it in one line",
        "describe it in 2 lines",
        "describe this in one line",
        "describe it in one sentence",
        "explain it in one line",
        "explain this in one line",
        "explain it in one sentence",
        "explain in 2 sentences",
        "explain in short",
        "give me a one line summary",
        "give me a 1 line explanation",
        "summarize this in one sentence",
        "summarize it in one line",
        "summarize the above briefly",
        "give me the key takeaway in one line",
        "give me the tldr",
        "tldr",
        "make it shorter",
        "make it concise",
        "can you make this brief?",
        "give me a short overview",
        "explain like I am 5 in one sentence",
        "give me a quick one line answer",
        "describe it briefly",
        "give a 2-line summary",
        "condense this explanation into one line",
        "give me a bullet point summary",
        "in simple terms in one sentence",
        "can you summarize this in few words?",
        "give a quick recap in one sentence",
        "sum it up in one line",
        "provide a one liner for this",
        "shorten this",
        "make it simpler",
        "give a concise summary",
    ],

    # 35. True Gibberish / Non-understandable
    "unknown": [
        "asdfghjkl",
        "qwertyuiop zxcvbnm",
        "12345 67890",
        "blablabla xyz 123",
        "zzz 999 ??? !!!",
        "random gibberish text here sdlkfjslkdfj",
        "sdkfjsldkfjsldfkj",
        "poiu qwer lkjh mnbv",
        "xxxx yyyy zzzz 1111",
        "????????? !!!!!!!!",
        "ajskdhfkjahsdfkjh",
        "qpowieurytlaksjdhfg",
        "1111111111111111",
        "ksjdhfksjdhfksjdhf",
        "zxcvbnmasdfghjkl",
        "mnbvcxzlkjhgfdsapoiuytrewq",
    ]
}

SAMPLE_NAMES = [
    "Nouman", "Noman", "Nawaz", "Alex", "Sarah", "John", "David", "Leo", "Michael",
    "Emma", "Sophia", "Ali", "Ahmed", "Usman", "Hamza", "Zain", "Bilal", "Daniel",
    "Chris", "Emily", "Jessica", "James", "Robert", "William", "Lucas", "Oliver",
    "Liam", "Noah", "Elena", "Maya", "Hannah", "Ryan", "Kevin", "Aria", "Ethan",
    "Hassan", "Fatima", "Ayesha", "Zara", "Tariq", "Mustafa", "Ibrahim", "Adam",
    "Farhan", "Kashif", "Sana", "Mariam", "Zubair", "Omer", "Saad", "Adeel"
]

PREAMBLES = [
    "Can you tell me, ",
    "Could you please explain ",
    "I want to ask, ",
    "Please tell me ",
    "Hey Atlas, ",
    "Atlas, ",
    "Quick question: ",
    "Help me understand ",
    "How do I ",
    "What is the best way to ",
    "I was wondering, ",
    "Do you know ",
    "Can you help me with ",
    "Kindly explain ",
    "Show me how to ",
    "Give me an example of ",
    "I'm curious about ",
    "Teach me about ",
]

SUFFIXES = [
    " please",
    " in detail",
    " step by step",
    " with an example",
    " for beginners",
    " right now",
    " with code snippet",
    " in clean code",
    " with best practices",
    "?",
    "!",
]

def build_master_dataset(output_path, target_samples_per_intent=800):
    rows = []
    random.seed(42)

    for intent, templates in INTENT_TEMPLATES.items():
        generated_for_intent = set()

        for tmpl in templates:
            if "{name}" in tmpl:
                for name in SAMPLE_NAMES:
                    phrase = tmpl.format(name=name).strip()
                    if phrase not in generated_for_intent:
                        generated_for_intent.add(phrase)
                        rows.append({"text": phrase, "intent": intent})
            else:
                phrase = tmpl.strip()
                if phrase not in generated_for_intent:
                    generated_for_intent.add(phrase)
                    rows.append({"text": phrase, "intent": intent})

        base_list = list(generated_for_intent)
        while len(generated_for_intent) < target_samples_per_intent:
            base = random.choice(base_list)
            pre = random.choice(PREAMBLES)
            suf = random.choice(SUFFIXES)
            
            clean_base = base.rstrip("?!. ")
            if clean_base.lower().startswith("how to") or clean_base.lower().startswith("what is") or clean_base.lower().startswith("can you"):
                style_choice = random.choice([1, 2, 3, 4, 5, 6])
                if style_choice == 1:
                    cand = f"{pre}{clean_base.lower()}{suf}"
                elif style_choice == 2:
                    cand = f"{clean_base.lower()}{suf}"
                elif style_choice == 3:
                    cand = f"{clean_base.capitalize()}"
                elif style_choice == 4:
                    cand = f"Atlas, {clean_base.lower()}"
                elif style_choice == 5:
                    cand = f"{clean_base.lower()}"
                else:
                    cand = f"{clean_base}?"
            else:
                cand = f"{pre}{clean_base.lower()}{suf}"

            cand = cand.strip()
            if cand not in generated_for_intent:
                generated_for_intent.add(cand)
                rows.append({"text": cand, "intent": intent})

    df = pd.DataFrame(rows)
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"[Master Dataset] Created {output_path} with {len(df)} samples across {df['intent'].nunique()} intents.")
    return df

if __name__ == "__main__":
    out_csv = os.path.join(os.path.dirname(__file__), "chatbot_training_data.csv")
    build_master_dataset(out_csv, target_samples_per_intent=800)
