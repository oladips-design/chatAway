const router = require("express").Router();
const { swaggerDocs, routerSwagger } = require("../utils/swagger");

const {
  userSignUp,
  userLogIn,
  getAllUsers,
  forgotPassword,
  resetPassword,
  getResetToken,
} = require("../Controllers/User.Contoller");
const { verify } = require("../middlewares/authMiddleware");

// define routes

router.post("/signup", userSignUp);
// Login route
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", userLogIn);

router.get("/users", verify, getAllUsers);
router.post("/forgot-password", forgotPassword);
router.route("/reset-password/:token").get(getResetToken).post(resetPassword);
routerSwagger.get("/docs");

module.exports = router;
