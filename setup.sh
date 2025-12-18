#!/bin/bash
# VoyageNest Setup Script
# Führe dieses Script mit sudo aus: sudo bash setup.sh

set -e

echo "=== VoyageNest Setup ==="
echo ""

# Check if running as root for PHP extension installation
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Bitte mit sudo ausführen für PHP Extensions:"
    echo "   sudo bash setup.sh"
    echo ""
    echo "Alternativ manuell installieren:"
    echo "   sudo apt-get install php8.3-xml php8.3-dom php8.3-mbstring php8.3-mysql"
    exit 1
fi

# PHP Extensions installieren
echo "📦 Installing PHP extensions..."
apt-get update -qq
apt-get install -y php8.3-xml php8.3-dom php8.3-mbstring php8.3-mysql php8.3-curl

# MySQL installieren falls nicht vorhanden
if ! command -v mysql &> /dev/null; then
    echo "📦 Installing MySQL..."
    apt-get install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
fi

# Redis installieren falls nicht vorhanden
if ! command -v redis-cli &> /dev/null; then
    echo "📦 Installing Redis..."
    apt-get install -y redis-server
    systemctl start redis-server
    systemctl enable redis-server
fi

# Node.js check
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo ""
echo "✅ System dependencies installed!"
echo ""
echo "Now run the following as your regular user:"
echo "   cd $(pwd) && bash init.sh"
