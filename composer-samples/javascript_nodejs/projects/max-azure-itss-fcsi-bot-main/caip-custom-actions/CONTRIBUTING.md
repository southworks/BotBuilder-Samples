# Contributing to project

This document outlines how to contribute to this project.  
This project is used to by Bots created using Bot Composer to have access to some basic functionalities (Custom Actions) created by CAIP.

## Getting started

Make sure you are familar with NodeJS and Mocha, additional knowledge of Botbuilder-js is helpful.

Adding new functionalities generally involves editing the following locations:

- exports - these contains the schemas outlining the input and output of your action
- src - you will add your own typescript to implement your action
- src/index.ts - make your action available
- tests - unit tests must exist and code coverage must be at least 90%
- README - add your functionality to the list with a quick description

## Merging

Make a pull request for your changes and then wait to see if it passes Fortify and Sonar scans (The usual security and coverage). Then someone on the team will merge your changes and in a few minutes a new version of the package will be available.
