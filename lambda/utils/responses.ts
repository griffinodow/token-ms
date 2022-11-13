const headers = { "Content-Type": "application/json" };

export const statusSuccess = () => ({
  statusCode: 200,
  headers,
  body: JSON.stringify({
    message: "success",
  }),
});

export const statusCreate = (body: object) => ({
  statusCode: 201,
  headers,
  body: JSON.stringify(body),
});

export const statusFail = (message: string = "Bad Request") => ({
  statusCode: 400,
  headers,
  body: JSON.stringify({
    message,
  }),
});
