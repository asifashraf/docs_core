#!/bin/bash
# Multiple methods to get Ubuntu/Linux version
echo ===================================================================
echo "Getting Ubuntu/Linux version using multiple methods"
echo ===================================================================
echo "Method 1: /etc/lsb-release"
cat /etc/lsb-release 2>/dev/null

echo -e "\nMethod 2: /etc/issue"
cat /etc/issue 2>/dev/null

echo -e "\nMethod 3: /etc/issue.net"
cat /etc/issue.net 2>/dev/null

echo -e "\nMethod 4: /proc/version"
cat /proc/version 2>/dev/null

echo -e "\nMethod 5: hostnamectl (systemd)"
hostnamectl 2>/dev/null | grep -i operating

echo -e "\nMethod 6: uname command"
uname -a 2>/dev/null

echo -e "\nMethod 7: /etc/debian_version (for Debian-based)"
cat /etc/debian_version 2>/dev/null

echo -e "\nMethod 8: Try original methods"
lsb_release -a 2>/dev/null || cat /etc/os-release 2>/dev/null