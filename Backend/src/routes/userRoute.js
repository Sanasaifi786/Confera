import { Router } from "express";
import { login, register, addToActivity, getAllActivities } from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToActivity);
router.route("/get_all_activities").get(getAllActivities);

export default router;