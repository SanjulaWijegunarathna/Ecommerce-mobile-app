

const test = async () => {
    // 1. Register
    const regRes = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Flow', email: 'flow@test.com', password: 'password123' })
    });
    const regData = await regRes.json();
    console.log("Register:", regData);

    // 2. Put
    const token = regData.token;
    const putRes = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: 'Flow Changed', email: 'flow@test.com', phone: '3334445555', dob: '01 01 2000' })
    });
    const putData = await putRes.json();
    console.log("Put:", putData);

    // 3. Login
    const loginRes = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'flow@test.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginData);
}

test();
