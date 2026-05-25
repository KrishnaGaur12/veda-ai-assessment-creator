import fs from 'fs';

async function testPdf() {
  try {
    const res = await fetch('http://localhost:5000/api/assignments/6a14ae390fb25cefa576c0db/pdf', {
      method: 'POST'
    });
    
    console.log("Status:", res.status);
    if (!res.ok) {
      const text = await res.text();
      console.log("Response:", text);
      return;
    }
    
    const buffer = await res.arrayBuffer();
    fs.writeFileSync('test-output.pdf', Buffer.from(buffer));
    console.log("PDF generated successfully, size:", buffer.byteLength, "bytes");
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testPdf();
