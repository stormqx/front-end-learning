# Why this tutorial
In order to learn redux, I translate [Full-Stack Redux Tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html)
into Chinese, and refactor the app from scratch using ES6 syntax.

# Full-Stack Redux Tutorial
A simple voting app for organizing live votes for parties, meetings and other gatherings of people.

# TechStack

* ReactJS(v15.4.1)
* React-Router(v3.0.0)
* Redux(v3.6.0)
* Immutable.js
* babel
* ES6
* Webpack
* Socket.io
* Mocha
* Chai


# Usage Instructions

The original author [Tero Parviainen](http://teropa.info/) organize the app code both on the client and 
on the server. We should install them separately.

## Voting-server

```
$ cd voting-server
$ npm install
$ npm run start
```
That`s it! The voting-server is running.

I wrote some unit tests about voting-server, if you`re interested in them, please enter the following command:

```
npm run test
```

## Voting-client

```
$ cd voting-client
$ npm install
$ npm run start
```
Then, open your browser and [http://localhost:8080](http://localhost:8080).

(Note: you should keep the voting-server alive before visiting [http://localhost:8080](http://localhost:8080))

I also wrote some unit tests about voting-client, just enter same command:
```
npm run test
```

#TODO List

* add some styles for a nicer UI.
* (Bug)In voting-client, This logic for determining whether the **hasVoted** entry is for the current pair is slightly
problematic.
* writing the exercises at the end of the tutorial


