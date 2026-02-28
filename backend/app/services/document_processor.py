import io
from PyPDF2 import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from uploaded PDF bytes."""
    pdf = PdfReader(io.BytesIO(file_bytes))
    text = ""
    print(f"DEBUG: Extracting text from PDF with {len(pdf.pages)} pages")
    for page in pdf.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    
    print(f"DEBUG: Total extracted characters: {len(text)}")
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> list[str]:
    """Splits text into smaller chunks with overlap."""
    words = text.split()
    chunks = []
    
    if not words:
        return chunks

    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap

    return chunks
