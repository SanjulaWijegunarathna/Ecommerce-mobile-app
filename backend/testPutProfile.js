const http = require('http');

// 1. We need a token. We can bypass by using a raw db update or we can fetch a token by logging in.
// Let's create a full integration script using fetch.
const testFlow = async () => {
    // We'll just run this on the node server context.
    const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const { token } = await res.json();
    console.log("Token:", token);

    // 2. Put profile
    const putRes = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: '9998887776', dob: '15 MAY 1995' })
    });
    
    const putData = await putRes.json();
    console.log("PUT Response:", putData);

    // 3. Login again to see if it persisted
    const res2 = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const loginData = await res2.json();
    console.log("Second Login Response:", loginData);
}

testFlow();
