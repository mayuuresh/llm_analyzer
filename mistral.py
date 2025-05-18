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
            model="mistralai/mistral-nemo:free",  # Ensure the model name is correct
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
