# AI Agents in Food Waste Matchmaker

## 1. Food Analysis Agent
- **Responsibility**: Analyzes images of donated food to identify type, quantity, and state.
- **Model**: `meta-llama/llama-4-scout-17b-16e-instruct`
- **Output**: JSON containing `description`, `type` (cooked/raw), and `servings`.

## 2. Matchmaking Engine
- **Responsibility**: Calculates compatibility scores between donations and NGOs.
- **Logic**: Considers proximity, refrigeration needs, urgency, and NGO capacity.
- **Output**: Ranked list of NGOs with reasoning.
