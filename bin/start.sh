#!/bin/sh

cd `dirname "$0"`/..

node --harmony server.js "$@"
