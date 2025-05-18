from flask import Flask, render_template, request, jsonify
from openai import OpenAI
from google import genai
import time

app = Flask(__name__)

# Initialize OpenAI client for GPT-4
gpt4_client = OpenAI(
    api_key="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"
)

# Initialize OpenRouter clients
openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

# Initialize Gemini
gemini_client = genai.Client(api_key="AIzaSyCE9EGd7AIPfq9JQlBAfV7H4axNZ5eZTuA")

def get_structured_prompt(prompt):
    return f"""Please provide a detailed, well-structured response to the following query. 
Use markdown formatting including:
- Headers (#, ##, ###)
- Lists (- or 1.)
- Tables (| Syntax | Description |)
- Code blocks (```)
- Bold (**) and italic (*) text where appropriate
- Proper paragraphs with line breaks

Query: {prompt}

Response:"""

def get_gpt4_response(prompt):
    try:
        completion = gpt4_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": get_structured_prompt(prompt)}]
        )
        if completion and completion.choices and len(completion.choices) > 0:
            return completion.choices[0].message.content
        return "GPT-4 Error: No response generated"
    except Exception as e:
        return f"GPT-4 Error: {str(e)}"

def get_llama_response(prompt):
    try:
        completion = openrouter_client.chat.completions.create(
            model="meta-llama/llama-3.3-8b-instruct:free",
            messages=[{"role": "user", "content": get_structured_prompt(prompt)}]
        )
        if completion and completion.choices and len(completion.choices) > 0:
            return completion.choices[0].message.content
        return "Llama Error: No response generated"
    except Exception as e:
        return f"Llama Error: {str(e)}"

def get_mistral_response(prompt):
    try:
        completion = openrouter_client.chat.completions.create(
            model="mistralai/mistral-nemo:free",
            messages=[{"role": "user", "content": get_structured_prompt(prompt)}]
        )
        if completion and completion.choices and len(completion.choices) > 0:
            return completion.choices[0].message.content
        return "Mistral Error: No response generated"
    except Exception as e:
        return f"Mistral Error: {str(e)}"

def get_deepseek_response(prompt):
    try:
        completion = openrouter_client.chat.completions.create(
            model="deepseek/deepseek-chat-v3-0324:free",
            messages=[{"role": "user", "content": get_structured_prompt(prompt)}]
        )
        if completion and completion.choices and len(completion.choices) > 0:
            return completion.choices[0].message.content
        return "DeepSeek Error: No response generated"
    except Exception as e:
        return f"DeepSeek Error: {str(e)}"

def get_gemini_response(prompt):
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=get_structured_prompt(prompt)
        )
        if response and hasattr(response, 'text'):
            return response.text
        return "Gemini Error: No response generated"
    except Exception as e:
        return f"Gemini Error: {str(e)}"

def evaluate_responses(prompt, responses):
    evaluation_prompt = f"""
    I have a user query and responses from 5 different AI models. Please analyze which response best answers the query accurately and completely.
    
    User Query: {prompt}
    
    Model Responses:
    1. GPT-4: {responses['GPT-4']}
    2. Llama: {responses['Llama']}
    3. Mistral: {responses['Mistral']}
    4. DeepSeek: {responses['DeepSeek']}
    5. Gemini: {responses['Gemini']}
    
    Which model (GPT-4, Llama, Mistral, DeepSeek, or Gemini) provided the most accurate and complete response to the user query? 
    First, provide your reasoning for the selection. Then, on a new line, write only the name of the best model.
    """
    
    try:
        completion = gpt4_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": evaluation_prompt}]
        )
        evaluation = completion.choices[0].message.content
        
        # Extract the model name from the last line
        lines = evaluation.strip().split('\n')
        best_model = lines[-1].strip()
        reasoning = '\n'.join(lines[:-1])
        
        # Validate the model name
        valid_models = ["GPT-4", "Llama", "Mistral", "DeepSeek", "Gemini"]
        for model in valid_models:
            if model.lower() in best_model.lower():
                return {
                    "best_model": model,
                    "reasoning": reasoning,
                    "response": responses[model]
                }
        
        # If no valid model found in the last line, make a best guess
        for model in valid_models:
            if model.lower() in evaluation.lower():
                return {
                    "best_model": model,
                    "reasoning": reasoning,
                    "response": responses[model]
                }
                
        # Default to GPT-4 if no model can be determined
        return {
            "best_model": "GPT-4",
            "reasoning": reasoning,
            "response": responses["GPT-4"]
        }
        
    except Exception as e:
        return {
            "best_model": "GPT-4",
            "reasoning": f"Error during evaluation: {str(e)}",
            "response": responses["GPT-4"]
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/query', methods=['POST'])
def query():
    data = request.json
    prompt = data.get('prompt', '')
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    # Get responses from all models
    responses = {
        "GPT-4": get_gpt4_response(prompt),
        "Llama": get_llama_response(prompt),
        "Mistral": get_mistral_response(prompt),
        "DeepSeek": get_deepseek_response(prompt),
        "Gemini": get_gemini_response(prompt)
    }
    
    # Evaluate which response is best
    evaluation = evaluate_responses(prompt, responses)
    
    return jsonify({
        "prompt": prompt,
        "best_model": evaluation["best_model"],
        "response": evaluation["response"],
        "reasoning": evaluation["reasoning"],
        "all_responses": responses
    })

if __name__ == '__main__':
    app.run(debug=True)