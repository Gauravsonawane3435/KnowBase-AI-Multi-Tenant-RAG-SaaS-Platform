import os
import requests

# Create a dummy PDF
with open('test_dummy.pdf', 'wb') as f:
    f.write(b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000288 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n381\n%%EOF\n')

# Authenticate
import uuid
random_email = f"test_{uuid.uuid4().hex[:6]}@example.com"

requests.post("http://127.0.0.1:8000/auth/register", json={"email": random_email, "password": "mypassword"})
login_res = requests.post("http://127.0.0.1:8000/auth/login", data={"username": random_email, "password": "mypassword"})

token = login_res.json().get("access_token")

# Upload Document
headers = {"Authorization": f"Bearer {token}"}
with open('test_dummy.pdf', 'rb') as f:
    files = {"file": ("test_dummy.pdf", f, "application/pdf")}
    res = requests.post("http://127.0.0.1:8000/documents/upload", headers=headers, files=files)

print("Status:", res.status_code)
print("Response:", res.text)

