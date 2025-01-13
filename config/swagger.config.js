// config/swagger.config.js
import SwaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WEGO API",
      version: "1.0.0",
      description:
        "WEGO API 명세서 / 헤더로 토큰 넣으실때 오른편 하단에 Authorize에 {AcessToken} 형식으로 중괄호 내부 값만 넣으셔야 합니다",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "로컬 서버",
      },
      {
        url: "http://43.203.244.245:3000/",
        description: "개발 서버",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./swagger/*"],
};

export const specs = SwaggerJsdoc(options);