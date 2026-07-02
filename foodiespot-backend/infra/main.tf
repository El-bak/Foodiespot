terraform {
  required_version = ">= 1.5.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "cicd_network" {
  name = "cicd-network"
  # Ne fait rien si le réseau existe déjà (créé par docker-compose)
  lifecycle {
    ignore_changes = all
  }
}

resource "docker_image" "foodiespot" {
  name = var.image_name
  # Ne PAS pull depuis un registry distant : image déjà buildée localement par le pipeline
  keep_locally = true
}

resource "docker_container" "foodiespot_staging" {
  name  = "foodiespot-staging"
  image = docker_image.foodiespot.image_id

  ports {
    internal = 4000
    external = var.staging_port
  }

  env = [
    "PORT=4000",
    "NODE_ENV=staging"
  ]

  networks_advanced {
    name = "cicd-network"
  }

  restart = "unless-stopped"
}
