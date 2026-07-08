// Native fetch used

const run = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "ritikdudee01@gmail.com",
        password: "R@123"
      })
    });

    console.log("Login Status:", res.status);
    console.log("Login Headers:", Object.fromEntries(res.headers.entries()));
    const data = await res.json();
    console.log("Login Response Body:", data);

    const res2 = await fetch("http://localhost:5000/api/nonexistent");
    console.log("Nonexistent Status:", res2.status);
    console.log("Nonexistent Headers:", Object.fromEntries(res2.headers.entries()));
    const data2 = await res2.json();
    console.log("Nonexistent Response Body:", data2);
  } catch (err) {
    console.error("Error:", err);
  }
};

run();
