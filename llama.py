from openai import OpenAI

# Initialize the OpenRouter client with your API key and endpoint
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",  # Replace with your actual OpenRouter API key
)

def generate_response():
    try:
        # Create a chat completion request
        completion = client.chat.completions.create(
            extra_headers={},  # Optional, can add site headers if needed
            model="meta-llama/llama-3.3-8b-instruct:free",  # Ensure the model name is correct
            messages=[
                {"role": "user", "content": "which company develop you"}  # Replace prompt as needed
            ],
        )

        # Check and print the response
        if completion and completion.choices:
            print("Response:", completion.choices[0].message.content)
        else:
            print("No choices returned. Full response:", completion)

    except Exception as e:
        # Handle any errors that occur during the API call
        print("An error occurred:", e)

# Call the function to generate and print the response
if __name__ == "__main__":
    generate_response()
