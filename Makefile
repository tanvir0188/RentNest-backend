.PHONY: dev build start prisma-generate prisma-migrate prisma-studio prisma-reset stripe-webhook help

# Default target when just running 'make'
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

# --- App Commands ---
dev: ## Run the development server (tsx watch)
	npm run dev

build: ## Build the typescript project
	npm run build

start: ## Start the built project
	npm run start

stripe-webhook: ## Listen to stripe webhooks
	npm run stripe:webhook

# --- Prisma Commands ---
prisma-generate: ## Generate prisma client
	npx prisma generate

prisma-migrate: ## Run prisma migrate dev
	npx prisma migrate dev

prisma-studio: ## Open Prisma Studio
	npx prisma studio

prisma-reset: ## Reset the database and apply migrations
	npx prisma migrate reset
