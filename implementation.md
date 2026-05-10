# Food Waste Matchmaker - API Implementation Details

This document outlines the technical changes and implementation details for the Food Waste Matchmaker backend API.

## 🛠️ Tech Stack Changes
- **Backend Framework**: Express.js (Node.js)
- **AI Engine**: Groq SDK
- **AI Model**: `meta-llama/llama-4-scout-17b-16e-instruct` (Llama 4 Vision)
- **Middleware**: 
  - `cors`: For cross-origin requests.
  - `multer`: For handling `multipart/form-data` image uploads.
  - `dotenv`: For secure environment variable management.

## 🚀 API Endpoint: `/api/analyze-food`
The core feature is a POST endpoint that takes an image and returns a structured AI analysis.

### Request Format
- **Method**: `POST`
- **Body**: `form-data`
- **Field**: `image` (File)

### Response Schema (Strict JSON)
The AI is instructed to return a strictly formatted JSON object with the following types:
| Key | Type | Description |
| :--- | :--- | :--- |
| `description` | `string` | A short visual description of the food. |
| `quantity` | `integer` | The numerical count or estimate of items/servings. |
| `unit` | `string` | MUST be one of: `"kgs"`, `"lbs"`, or `"servings"`. |
| `dietType` | `string` | Fixed values: `"veg"` or `"non-veg"`. |
| `type` | `string` | Fixed values: `"raw"` or `"cooked"`. |

## 🛡️ Security & Robustness
- **API Key Sanitization**: The server automatically trims accidental quotes or whitespace from the `GROQ_API_KEY` to prevent connection errors.
- **Git Protection**: `.gitignore` has been updated to ignore `.env` files, ensuring API keys are never leaked to the public repository.
- **JSON Enforcement**: Uses Groq's native `json_object` response format to guarantee the output is always parseable by the front-end team.

## 📦 Running the API
```bash
# Install dependencies
npm install

# Start the server
node server.js
```
