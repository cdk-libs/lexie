#!/bin/bash

set -e

echo "👀 Checking if new CDK Versions are available..."
# Extract CDK_VERSION from .projenrc.ts
current_cdk_version=$(grep "cdkVersion:" .projenrc.ts | sed -E "s/.*'([0-9.]+)'.*/\1/")
latest_cdk_version=$(npm view aws-cdk-lib version)

if [ "$latest_cdk_version" != "$current_cdk_version" ]; then
    echo "New CDK version available: $latest_cdk_version (current: $current_cdk_version)"
    # Update CDK_VERSION in .projenrc.ts
    sed -i '' "s/.*cdkVersion: '[0-9.]*',/  cdkVersion: '$latest_cdk_version',/" .projenrc.ts
    echo "Updated CDK_VERSION in .projenrc.ts to $latest_cdk_version"

    # Run projen to apply the changes
    npx projen
else
    echo "CDK is up to date (version $current_cdk_version)"
fi

echo "🧶 Updating projen..."
npx projen upgrade

echo "✅ Update complete!"