@echo off
Title ChatDACS init
Echo ChatDACS initializing......
call npm install -g cnpm --registry=https://registry.npm.taobao.org
call cnpm ci
Echo init finish
call run.bat
PAUSE