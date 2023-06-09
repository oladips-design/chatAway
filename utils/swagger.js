const express = require("express");
const routerSwagger = express.Router();
app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Authentication API",
      version: "1.0.0",
      description: "API for user authentication",
    },
    servers: [
      {
        url: "http://localhost:4000/docs",
        description: "Development server",
      },
    ],
  },
  apis: ["../routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

function swaggerDocs(app, port) {
  // swagger page
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // docs in JSON format
  app.get("docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Docs available ar http://localhost:${port}/docs`);
}
routerSwagger.use("/docs", swaggerUi.serve);
routerSwagger.get("/docs", swaggerUi.setup(swaggerSpec));

module.exports = { swaggerDocs, routerSwagger };

// {
//   "id": "640b1df9295819ecb18734db",
//   "name": "dipo",
//   "email": "oladeleoladipupo555@gmail.com",
//   "isAdmin": false,
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MGIxZGY5Mjk1ODE5ZWNiMTg3MzRkYiIsImlhdCI6MTY3ODQ1MDE2OSwiZXhwIjoxNjc4NTM2NTY5fQ.-GizaL-DVlThrQHvktBLPPkPBSO9nrXdtXsfwE1H4TE"
// }
