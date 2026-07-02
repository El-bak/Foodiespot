output "staging_url" {
  description = "URL de l'environnement de staging FoodieSpot, utilisée par le Smoke Test du pipeline"
  value       = "http://localhost:${var.staging_port}"
}

output "staging_container_name" {
  value = docker_container.foodiespot_staging.name
}
