# Banking Bot (BITS Pilani)

> The project can run on any debian based linux distro (eg. Ubuntu).

> The code has been developed and tested in python3.8. Later python versions aren't compatible with the dependencies. If later version is installed, please follow steps from here: "https://linuxize.com/post/how-to-install-python-3-8-on-ubuntu-18-04/"

> The voice feature works only in **Google Chrome** browser.

## Installation

`./run install`

> The command requires python3-venv to be installed. Please follow the instructions in error message if any error occurs.

## Starting

### Easy way:

`./run start`

> In background, it executes four commands to start RASA, RASA actions, API, and UI.

### Expert way:

In 4 terminals, run the following commands:

1. `./run bot`
2. `./run api`
3. `./run ui`

> By using these commands, you'll have more control on what is happening and where the errors might me, if any.
