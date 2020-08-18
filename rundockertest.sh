#!/usr/bin/env bash
for v in 7 8; do
    echo "==================="
    echo "Testing in CentOS $v"
    echo "==================="
    docker build -t jiggle_centos_$v -f Dockerfile.centos . --build-arg version=$v > /dev/null 2>&1
    docker run --rm -ti jiggle_centos_$v
done

for v in stable unstable; do
    echo "=========================="
    echo "Testing in Debian $v"
    echo "=========================="
    docker build -t jiggle_debian_$v -f Dockerfile.debian . --build-arg version=$v > /dev/null 2>&1
    docker run --rm -ti jiggle_debian_$v
done
