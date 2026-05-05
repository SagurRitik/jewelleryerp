// import jwt from "jsonwebtoken";

// export const generateToken = (res, userId, role) => {
//   const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
//     expiresIn: "1d",
//   });

//   res.cookie("jwt", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV !== "development",
//     sameSite: "strict",
//     maxAge: 24 * 60 * 60 * 1000,
//   });
// };

import jwt from "jsonwebtoken";

export const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,       // 🔥 MUST be false for HTTP
    sameSite: "lax",     // 🔥 safest working option
    maxAge: 24 * 60 * 60 * 1000,
  });
};