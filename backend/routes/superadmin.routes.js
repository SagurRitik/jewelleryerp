// // import express from "express";
// // import { createSuperAdmin } from "../controllers/auth/superadmin.controller.js";

// // const router = express.Router();

// // router.post("/create-superadmin", createSuperAdmin);

// // export default router;

// import express from "express";
// import { createSuperAdmin } from "../controllers/auth/superadmin.controller.js";


// const router = express.Router();

// // Only logged-in superadmin can create another superadmin
// router.post(
//   "/create-superadmin",
//   createSuperAdmin
// );

// router.put(
//   "/change-password",
//   protect, // your auth middleware
//   changePassword
// );

// export default router;


import express from "express";
import { createSuperAdmin } from "../controllers/auth/superadmin.controller.js";
import { changePassword } from "../controllers/auth/superadmin.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-superadmin", createSuperAdmin);

/* Change password (logged-in user only) */
router.put(
  "/change-password",
  protect,
  changePassword
);

export default router;