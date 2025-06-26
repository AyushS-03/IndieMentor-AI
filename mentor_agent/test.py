import requests

# JSON only
response = requests.post(
    "http://localhost:8000/setup",
    json={"user_id": "user123"}
)
print(response.status_code, response.json())

# # With file
# with open("document.docx", "rb") as f:
#     response = requests.post(
#         "http://localhost:8000/setup/",
#         data={"data": '{"user_id": "user123"}'},
#         files={"file": f}
#     )
#     print(response.status_code, response.json())