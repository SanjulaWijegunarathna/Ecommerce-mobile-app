const http = require('http');

async function run() {
  try {
    // 1. Create unique user
    const ustr = Math.random().toString(36).substring(7);
    const regRes = await fetch('http://127.0.0.1:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'TestUser', email: `test${ustr}@test.com`, password: 'password123' })
    });
    
    const loginData = await regRes.json();
    if (!regRes.ok) {
      console.log('Reg failed:', loginData);
      return;
    }
    const token = loginData.token;

    // 2. submit order
    const orderData = {
      orderItems: [
        {
          name: "Test item",
          qty: 1,
          image: "/test.jpg",
          price: 100,
          product: loginData._id // Valid ObjectId for product just to pass validation if any
        }
      ],
      shippingAddress: {
        address: "Test",
        city: "Test",
        postalCode: "123",
        country: "Test"
      },
      itemsPrice: 100,
      shippingPrice: 0,
      totalPrice: 100
    };

    const orderRes = await fetch('http://127.0.0.1:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    const orderRespData = await orderRes.text();
    console.log('Order Response STATUS:', orderRes.status);
    console.log('Order Response BODY:', orderRespData);

  } catch(e) {
    console.log('Script Error:', e);
  }
}
run();
