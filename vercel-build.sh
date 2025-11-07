#!/bin/bash

# Install Flutter
FLUTTER_VERSION="3.19.0"
FLUTTER_CHANNEL="stable"
FLUTTER_DIR="/tmp/flutter"

if [ ! -d "$FLUTTER_DIR" ]; then
  git clone -b "$FLUTTER_VERSION" https://github.com/flutter/flutter.git "$FLUTTER_DIR"
fi

export PATH="$FLUTTER_DIR/bin:$PATH"

flutter channel $FLUTTER_CHANNEL
flutter doctor

# Build the Flutter app
flutter build web