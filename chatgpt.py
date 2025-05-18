from openai import OpenAI

client = OpenAI(
  api_key="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"
)

completion = client.chat.completions.create(
  model="gpt-4o-mini",
  store=True,
  messages=[
    {"role": "user", "content": "what is bat"}
  ]
)

print(completion.choices[0].message);
