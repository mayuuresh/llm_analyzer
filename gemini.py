from google import genai

client = genai.Client(api_key="AIzaSyCE9EGd7AIPfq9JQlBAfV7H4axNZ5eZTuA")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="What is batman?",
)

print(response.text)