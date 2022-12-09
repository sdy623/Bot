#!/bin/bash

metode=$1

if [ "$metode" = "b" ];then
 docker build -t "siakbary/yuukibot:latest" --progress=plain .;
fi

if [ "$metode" = "s" ];then
 echo "Run Localhost"
 npm run start
fi

if [ "$metode" = "reg" ];then
 npm run reg
fi

if [ "$metode" = "t" ];then
 echo "Run Docker"
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