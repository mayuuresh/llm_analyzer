import re
from openai import OpenAI

client = OpenAI(
  api_key="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"
)
completion = client.chat.completions.create(
    model="gpt-4o-mini",
    store=True,
    messages=[
        {"role": "user", "content": "tell feature of bat animal"}
    ]
)

# Extract the content of the response
response = completion.choices[0].message.content

# Format the response for better readability
def format_response(content):
    # Convert **bold** to HTML <strong>
    formatted_content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)

    # Convert numbered lists to HTML <ol>
    formatted_content = re.sub(r"\n\d+\. (.+)", r"<li>\1</li>", formatted_content)
    formatted_content = re.sub(r"(.*<li>.*)", r"<ol>\1</ol>", formatted_content, 1)

    # Convert newlines to <br> for better HTML rendering
    formatted_content = formatted_content.replace("\n", "<br>")

    return formatted_content

formatted_response = format_response(response)

# Print the formatted response
print(formatted_response)