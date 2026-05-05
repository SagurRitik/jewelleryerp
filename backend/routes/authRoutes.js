


import express from "express";
import { inviteUser, setPassword, login,logout,getAllUsers,toggleUserStatus,deleteUser,changePassword } from "../controllers/auth/auth.controller.js";
import { protect } from "../middlewares/protect.js";
import { authorize } from "../middlewares/authorize.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { getProfile } from "../controllers/auth/auth.controller.js";

const router = express.Router();

router.post("/invite", protect, authorize("admin", "superadmin"), inviteUser);
router.post("/login", login);
router.post("/set-password/:token", setPassword);
router.get("/profile", protect, getProfile);
router.post("/logout", logout); 
router.put("/change-password", protect, changePassword);

router.get("/all-users", protect, authorize("superadmin","admin"), getAllUsers);
router.patch("/toggle-status/:id", protect, authorize("superadmin","admin"), toggleUserStatus);
router.delete("/delete/:id", protect, authorize("superadmin","admin"), deleteUser);

export default router;
