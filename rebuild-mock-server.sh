#!/bin/bash

# Step 1: Find and stop the running mock-server container (if any)
container_id=$(docker ps -q --filter "ancestor=mock-server")

if [ -n "$container_id" ]; then
    echo "Stopping and removing existing mock-server container..."
    docker stop "$container_id"
    docker rm "$container_id"
else
    echo "No running mock-server container found."
fi

# Step 2: Remove the old mock-server image
image_id=$(docker images -q mock-server)

if [ -n "$image_id" ]; then
    echo "Removing old mock-server image..."
    docker rmi "$image_id"
else
    echo "No existing mock-server image found."
fi

# Step 3: Build a new mock-server image
echo "Building new mock-server image..."
docker build -t mock-server .

# Step 4: Run the new mock-server container
echo "Starting new mock-server container..."
docker run -p 3003:3003 mock-server

echo "Mock server is running on port 3003."
