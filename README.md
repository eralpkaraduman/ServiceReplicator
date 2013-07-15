Service Replicator
==================

Small local node.js server which can be used to replicate remote web server endpoints for fast development purposes.

  - Run locally on where you develop your whatever client application
  - Create a server to be replicated
  - Enter service paths
  - Enter endpoint responses
  - Change your .hosts file or put dev args on your code to force app to use this server rather than the remote.
  - Tweak responses on the fly. (no yet implemented)
  - Tears of joy.


#Prerequisites

 - Administrator rights (to run on 80 port, if you don't need 80 you don't need admin rights)
 - Have node.js installed. (v0.8.14)
 - Have NPM installed.

#Installation

 - Download of clone this repository
 - Open terminal and cd into downloaded directory
 - $ npm install

#To Start

 $ sudo node app.js port=80

 (default port is 3000)

#To Stop

 ctrl+c


To Do
=====

 - Toggle servers on/off
 - Parametric responses
 - Capturing requests



