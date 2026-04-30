async function testRegistration() {
  try {
    const data = new FormData();
    data.append('role', 'vendor');
    data.append('username', 'testvendor99' + Date.now());
    data.append('password', 'password123');
    data.append('fullName', 'Test Vendor');
    data.append('homeAddress', '123 Test St');
    data.append('businessAddress', '456 Biz Ave');
    data.append('businessType', 'Test Type');
    data.append('aadhaar', '123456789012');

    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      body: data
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    console.log('Success:', json);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testRegistration();
