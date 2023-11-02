#!/bin/sh

echo "Creating serial port $HOME/dev/ttyGRBL0..."

mkdir -p ~/dev
while sleep 1;
do
  socat pty,link=$HOME/dev/ttyGRBL0,waitslave tcp:192.168.32.8:6000
done
