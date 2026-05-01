const test = async () => {
    // 1. Register
    const regRes = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Flow2', email: 'flow2@test.com', password: 'password123' })
    });
    const regData = await regRes.json();

    // 2. Add to cart
    const token = regData.token;
    const cartRes = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cart: [{ id: 1, name: 'Item' }] })
    });
    console.log("Cart After Add:", (await cartRes.json()).cart);

    // 3. Put personal info (does this wipe cart?)
    const putRes = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: '1112223333' })
    });
    console.log("Cart After Put Personal Info:", (await putRes.json()).cart);

    // 4. Login
    const loginRes = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'flow2@test.com', password: 'password123' })
    });
    console.log("Cart After Login:", (await loginRes.json()).cart);
}

test();
