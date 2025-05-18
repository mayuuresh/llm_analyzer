from openai import OpenAI
import google.generativeai as genai

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
genai.configure(api_key="AIzaSyDJC5a7hQxeWBNgHHGT1JtXzRiZPcKxiAo")
gemini_model = genai.GenerativeModel('gemini-pro')

def get_gpt4_response(prompt):
    try:
        completion = gpt4_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"GPT-4 Error: {str(e)}"

def get_llama_response(prompt):
    try:
        completion = openrouter_client.chat.completions.create(
            model="meta-llama/llama-3.3-8b-instruct:free",
            messages=[{"role": "user", "content": prompt}]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Llama Error: {str(e)}"

def get_mistral_response(prompt):
    try:
        completion = openrouter_client.chat.completions.create(
            model="mistralai/mistral-nemo:free",
            messages=[{"role": "user", "content": prompt}]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Mistral Error: {str(e)}"

def get_deepseek_response(prompt):
    try:
        completion = openrouter_client.chat.completions.create(
            model="deepseek/deepseek-chat-v3-0324:free",
            messages=[{"role": "user", "content": prompt}]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"DeepSeek Error: {str(e)}"

def get_gemini_response(prompt):
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gemini Error: {str(e)}"

def main():
    while True:
        user_prompt = input("\nEnter your prompt (or 'quit' to exit): ")
        
        if user_prompt.lower() == 'quit':
            break

        print("\nGetting responses from all models...")
        
        # Get responses from all models
        responses = {
            "GPT-4": get_gpt4_response(user_prompt),
            "Llama": get_llama_response(user_prompt),
            "Mistral": get_mistral_response(user_prompt),
            "DeepSeek": get_deepseek_response(user_prompt),
            "Gemini": get_gemini_response(user_prompt)
        }

        # Display all responses
        print("\nResponses from each model:")
        print("-" * 50)
        for model, response in responses.items():
            print(f"\n{model}:")
            print(response)
            print("-" * 50)

if __name__ == "__main__":
    main() 