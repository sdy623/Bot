#!/bin/bash

metode=$1

if [ "$metode" = "build" ];then
 docker build -t "siakbary/yuukibot:latest" .;
fi

if [ "$metode" = "localhost" ];then
 npm run
fi

if [ "$metode" = "testing" ];then
 docker run --rm -it -v //e/DOC/Akbar/Work/site/Yuuki-Bot/src/config.json:/app/src/config.json siakbary/yuukibot:latest
fi

# Push Private
if [ "$metode" = "private_push" ];then
 docker push repo.yuuki.me/yuukibot:latest
fi

# Push Public
if [ "$metode" = "push" ];then
 docker push siakbary/yuukibot:latest
fi