variable "image_name" {
  description = "Nom et tag de l'image Docker FoodieSpot à déployer en staging (ex: foodiespot-backend:abc1234)"
  type        = string
  default     = "foodiespot-backend:latest"
}

variable "staging_port" {
  description = "Port exposé sur l'hôte pour l'environnement de staging"
  type        = number
  default     = 4001
}
