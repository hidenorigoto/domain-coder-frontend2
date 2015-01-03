#!/bin/sh

grunt build
rm -rf ../domain-coder-gh-pages2/*
cp -R dist/* ../domain-coder-gh-pages2/
cd ../domain-coder-gh-pages2
git push origin gh-pages --force
