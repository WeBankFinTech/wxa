#!/bin/bash

exec node node_modules/.bin/babel --watch src --out-dir dist &

exec node node_modules/.bin/babel --watch lib --out-dir lib-dist &
